package com.employee.Emp.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "banners")
public class Banner implements SequenceEntity {
    public static final String SEQUENCE_NAME = "banners_sequence";

    @Id
    private Long id;

    private String name;
    private String title;
    private String subtitle;
    private String image;
    private String position;
    private Integer priority = 1;

    @Field("is_active")
    private Boolean isActive = true;

    @Field("start_date")
    private LocalDateTime startDate;

    @Field("end_date")
    private LocalDateTime endDate;

    @Field("cta_text")
    private String ctaText;

    @Field("cta_link")
    private String ctaLink;

    @Field("cta_target")
    private String ctaTarget = "_self";

    @Field("display_count")
    private Integer displayCount = 0;

    @Field("click_count")
    private Integer clickCount = 0;

    @Field("conversion_count")
    private Integer conversionCount = 0;

    @Field("event_id")
    private Long eventId;

    @Transient
    private Event event;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;

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
