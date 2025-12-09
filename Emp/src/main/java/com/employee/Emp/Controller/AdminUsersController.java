package com.employee.Emp.Controller;

import com.employee.Emp.Entity.UserInfo;
import com.employee.Emp.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ROLE_ADMIN')")
@CrossOrigin
public class AdminUsersController {

    @Autowired
    private UserRepository userRepository;

    /**
     * GET /api/admin/users?page=1&limit=10
     * Returns paginated list of users
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder) {

        // Page is 1-indexed from frontend, but Spring Data uses 0-indexed
        int pageIndex = Math.max(0, page - 1);

        Sort sort = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageIndex, limit, sort);

        Page<UserInfo> userPage = userRepository.findAll(pageable);

        // Convert to DTOs to avoid exposing passwords
        List<Map<String, Object>> users = userPage.getContent().stream()
                .map(this::toUserDTO)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("users", users);
        response.put("currentPage", page);
        response.put("totalPages", userPage.getTotalPages());
        response.put("totalUsers", userPage.getTotalElements());
        response.put("limit", limit);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/admin/users/analytics
     * Returns user analytics data
     */
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getUserAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        long totalUsers = userRepository.count();

        // Users registered in last 30 days
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<UserInfo> recentUsers = userRepository.findByCreatedAtAfter(thirtyDaysAgo);
        long newUsersLast30Days = recentUsers.size();

        // Users registered in last 7 days
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        long newUsersLast7Days = recentUsers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(sevenDaysAgo))
                .count();

        // Role distribution
        List<UserInfo> allUsers = userRepository.findAll();
        long adminCount = allUsers.stream()
                .filter(u -> u.getRoles() != null && u.getRoles().contains("ADMIN"))
                .count();
        long customerCount = totalUsers - adminCount;

        analytics.put("totalUsers", totalUsers);
        analytics.put("newUsersLast30Days", newUsersLast30Days);
        analytics.put("newUsersLast7Days", newUsersLast7Days);
        analytics.put("adminCount", adminCount);
        analytics.put("customerCount", customerCount);
        analytics.put("growthRate", totalUsers > 0 ? (double) newUsersLast30Days / totalUsers * 100 : 0);

        return ResponseEntity.ok(analytics);
    }

    /**
     * GET /api/admin/users/{id}
     * Returns a single user by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Integer id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(toUserDTO(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * DELETE /api/admin/users/{id}
     * Deletes a user
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable Integer id) {
        if (!userRepository.existsById(id)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "User not found");
            return ResponseEntity.notFound().build();
        }

        userRepository.deleteById(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "User deleted successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/admin/users/{id}/role
     * Updates user role
     */
    @PutMapping("/{id}/role")
    public ResponseEntity<Map<String, Object>> updateUserRole(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {

        return userRepository.findById(id)
                .map(user -> {
                    String newRole = request.get("role");
                    if (newRole != null) {
                        user.setRoles(newRole);
                        userRepository.save(user);
                    }

                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "User role updated");
                    response.put("user", toUserDTO(user));
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Convert UserInfo entity to a safe DTO (no password)
     */
    private Map<String, Object> toUserDTO(UserInfo user) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", user.getId());
        dto.put("username", user.getUsername());
        dto.put("email", user.getEmail());
        dto.put("phone", user.getPhone());
        dto.put("roles", user.getRoles());
        dto.put("createdAt", user.getCreatedAt());
        return dto;
    }
}
