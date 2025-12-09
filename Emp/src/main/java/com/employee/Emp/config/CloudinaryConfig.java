package com.employee.Emp.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary(@Value("${CLOUDINARY_URL}") String cloudinaryUrl) {
        // CLOUDINARY_URL is in the form cloudinary://api_key:api_secret@cloud_name
        return new Cloudinary(cloudinaryUrl);
    }
}
