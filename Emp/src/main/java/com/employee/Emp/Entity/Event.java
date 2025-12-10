package com.employee.Emp.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "events")
public class Event implements SequenceEntity {
    public static final String SEQUENCE_NAME = "events_sequence";

    @Id
    private Long id;

    @Field("name")
    private String name;

    private String description;

    @Field("start_date")
    private LocalDateTime startDate;

    @Field("end_date")
    private LocalDateTime endDate;

    @Field("is_active")
    private Boolean isActive = true;

    private String type;

    @Field("discount_percentage")
    private Double discountPercentage;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @Override
    public String getSequenceName() {
        return SEQUENCE_NAME;
    }

    public boolean isCurrentlyActive() {
        if (Boolean.FALSE.equals(isActive)) {
            return false;
        }
        LocalDateTime now = LocalDateTime.now();
        if (startDate != null && now.isBefore(startDate)) {
            return false;
        }
        if (endDate != null && now.isAfter(endDate)) {
            return false;
        }
        return true;
    }
}
