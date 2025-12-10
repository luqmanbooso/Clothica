package com.employee.Emp.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class UserInfo implements SequenceEntity {
    public static final String SEQUENCE_NAME = "users_sequence";

    @Id
    private Long id;
    private String username;

    @Field("email")
    @Indexed(unique = true)
    private String email;
    private String password;
    private String roles;
    private String phone;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @Override
    public String getSequenceName() {
        return SEQUENCE_NAME;
    }
}
