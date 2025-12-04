package com.employee.Emp.filter;

import com.employee.Emp.Service.JWTservice;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
//The "Security Gatekeeper"
public class JwtAuthFilter extends OncePerRequestFilter {
    private final UserDetailsService userDetailsService;
    private final JWTservice jwTservice;

    @Autowired
    public JwtAuthFilter(UserDetailsService userDetailsService, JWTservice jwTservice){
        this.userDetailsService = userDetailsService;
        this.jwTservice = jwTservice;
    }


    //Intercept EVERY Request
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        if(authHeader !=null && authHeader.startsWith("Bearer ")){
            //Extracts Token from Header
            token = authHeader.substring(7);
            username = jwTservice.extractUsername(token);
        }

        //Validates AND Sets Authentication
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null){
            UserDetails userDetails= userDetailsService.loadUserByUsername(username);
            if(jwTservice.validateToken(token,userDetails)){
                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userDetails,null,userDetails.getAuthorities());
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }
        }

        //Allows Request to Continue
        filterChain.doFilter(request,response);

        // Runs for EVERY HTTP request to your application!
        // GET, POST, PUT, DELETE - ALL of them!
    }


}

/*
-----JWT----
Doesn't know about HTTP, requests, databases, or Spring Security
Pure JWT operations:
- encode(payload) → token
- decode(token) → payload
- verify(token, secret) → true/false
- checkExpiry(token) → true/false

JwtAuthFilter (Stateful, Integration Layer):
// Knows about EVERYTHING:
- HTTP requests/responses
- Spring Security context
- Database (via UserDetailsService)
- JWT tokens (via JWTservice)
- Sets up authentication for entire request
*/