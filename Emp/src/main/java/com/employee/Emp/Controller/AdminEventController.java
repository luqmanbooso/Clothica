package com.employee.Emp.Controller;

import com.employee.Emp.Entity.Event;
import com.employee.Emp.Repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/events")
@PreAuthorize("hasRole('ROLE_ADMIN')")
@CrossOrigin
public class AdminEventController {

    @Autowired
    private EventRepository eventRepository;

    /**
     * GET /api/admin/events - List all events
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllEvents() {
        List<Event> events = eventRepository.findAllByOrderByStartDateDesc();

        List<Map<String, Object>> eventDtos = events.stream()
                .map(this::toEventDTO)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("events", eventDtos);
        response.put("total", events.size());

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/admin/events/{id} - Get single event
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getEventById(@PathVariable Long id) {
        return eventRepository.findById(id)
                .map(event -> ResponseEntity.ok(toEventDTO(event)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/admin/events - Create new event
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createEvent(@RequestBody Map<String, Object> request) {
        Event event = fromEventRequest(request);
        Event created = eventRepository.save(event);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Event created successfully");
        response.put("event", toEventDTO(created));

        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/admin/events/{id} - Update event
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateEvent(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {

        return eventRepository.findById(id)
                .map(event -> {
                    Event updated = fromEventRequest(request);
                    updated.setId(event.getId());
                    updated.setCreatedAt(event.getCreatedAt());
                    Event saved = eventRepository.save(updated);

                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Event updated successfully");
                    response.put("event", toEventDTO(saved));
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * DELETE /api/admin/events/{id} - Delete event
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteEvent(@PathVariable Long id) {
        if (!eventRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        eventRepository.deleteById(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Event deleted successfully");
        return ResponseEntity.ok(response);
    }

    // ========== Helper Methods ==========

    private Map<String, Object> toEventDTO(Event event) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("_id", event.getId().toString());
        dto.put("id", event.getId());
        dto.put("name", event.getName());
        dto.put("description", event.getDescription());
        dto.put("type", event.getType());
        dto.put("startDate", event.getStartDate());
        dto.put("endDate", event.getEndDate());
        dto.put("isActive", event.getIsActive());
        dto.put("discountPercentage", event.getDiscountPercentage());
        dto.put("createdAt", event.getCreatedAt());
        return dto;
    }

    private Event fromEventRequest(Map<String, Object> request) {
        Event event = new Event();

        event.setName((String) request.get("name"));
        event.setDescription((String) request.get("description"));
        event.setType((String) request.get("type"));

        if (request.get("discountPercentage") != null) {
            event.setDiscountPercentage(((Number) request.get("discountPercentage")).doubleValue());
        }

        if (request.get("isActive") != null) {
            event.setIsActive((Boolean) request.get("isActive"));
        }

        if (request.get("startDate") != null) {
            String startDate = (String) request.get("startDate");
            event.setStartDate(LocalDate.parse(startDate).atStartOfDay());
        }

        if (request.get("endDate") != null && !((String) request.get("endDate")).isEmpty()) {
            String endDate = (String) request.get("endDate");
            event.setEndDate(LocalDate.parse(endDate).atTime(23, 59, 59));
        }

        return event;
    }
}
