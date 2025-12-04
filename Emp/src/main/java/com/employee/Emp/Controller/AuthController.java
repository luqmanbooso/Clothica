package com.employee.Emp.Controller;

import com.employee.Emp.Entity.AuthRequest;
import com.employee.Emp.Entity.UserInfo;
import com.employee.Emp.Service.JWTservice;
import com.employee.Emp.Service.UserInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import javax.crypto.SecretKey;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    private UserInfoService userInfoService;

    private final JWTservice jwtService;

    private AuthenticationManager authenticationManager;

    public AuthController(UserInfoService userInfoService,
                          JWTservice jwtService,
                          AuthenticationManager authenticationManager) {
        this.userInfoService = userInfoService;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/register")
    public String Register(@RequestBody UserInfo user){
        return userInfoService.addUser(user);
    }

    @PostMapping("/generatetoken")
    public String generateToken(@RequestBody AuthRequest authRequest){
        // 1. Gets username/password from request
        // 2. Passes to AuthenticationManager for validation -> this is altered in securityconfig using @Bean
        Authentication authentication= authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(authRequest
                        .getUsername(),authRequest.getPassword())
                );

        // 3. If authentication successful, generates JWT
        if (authentication.isAuthenticated()){
            return jwtService.generateToken(authRequest.getUsername());
        } else {
            // 4. If fails, throws exception
            throw new UsernameNotFoundException("Invalid user request!");
        }
    }

//    @PostMapping("/forgot-password")
//    public String forgotPassword(@RequestParam String email) {
//        // Generate reset token, send email
//    }
//
//    @PostMapping("/reset-password")
//    public String resetPassword(@RequestParam String token,
//                                @RequestParam String newPassword) {
//        // Validate token, update password
//    }

//    @PostMapping("/login")
//    public String login() {
//        return jwtService.getJWTToken();
//    }

    @GetMapping("/username")
    public String getUsername(@RequestParam String token){
        return jwtService.extractUsername(token);
    }
}
