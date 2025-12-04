package com.employee.Emp.Service;

import com.employee.Emp.Entity.UserInfo;
import com.employee.Emp.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserInfoService implements UserDetailsService {

    private final UserRepository repository;
    private final PasswordEncoder encoder;

    @Autowired
    public UserInfoService(UserRepository repository, PasswordEncoder encoder){
        this.repository = repository;
        this.encoder = encoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<UserInfo> user = repository.findByEmail(username);

        if (user.isEmpty()) {
            throw new UsernameNotFoundException("User not found with email: " + username);
        }

        UserInfo user1 = user.get();
        System.out.println("Loading user: " + username + " with roles: " + user1.getRoles());

        return new User(
                user1.getEmail(),
                user1.getPassword(),
                Arrays.stream(user1.getRoles().split(","))
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList())
        );
    }

    public String addUser(UserInfo userInfo) {
        System.out.println("Registering user: " + userInfo.getEmail());

        if(userInfo.getEmail().isEmpty()){
            throw  new IllegalArgumentException("Email required");
        }

        if(userInfo.getPassword().isEmpty()){
            throw new IllegalArgumentException("Password required");
        }

        if(userInfo.getUsername().isEmpty()){
            userInfo.setUsername(userInfo.getEmail());
        }

        // Check if user already exists
        Optional<UserInfo> existingUser = repository.findByEmail(userInfo.getEmail());
        if (existingUser.isPresent()) {
            return "User already exists!";
        }

        // Encrypt password before saving
        userInfo.setPassword(encoder.encode(userInfo.getPassword()));

        // Ensure roles field is not null
        if (userInfo.getRoles() == null || userInfo.getRoles().isEmpty()) {
            userInfo.setRoles("ROLE_USER");
        }

        repository.save(userInfo);
        System.out.println("User registered successfully: " + userInfo.getEmail());
        return "User added successfully!";
    }
}