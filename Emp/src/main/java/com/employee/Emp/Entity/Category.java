package com.employee.Emp.Entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "categories")
public class Category implements SequenceEntity {
    public static final String SEQUENCE_NAME = "categories_sequence";

    @Id
    private Long id;

    @Field("name")
    private String name;

    @Field("description")
    private String description;

    @Field("is_active")
    private Boolean isActive = true;

    @Field("sort_order")
    private Integer sortOrder;

    @Field("parent_id")
    private Long parentId;

    @Field("image")
    private String image;

    @Override
    public String getSequenceName() {
        return SEQUENCE_NAME;
    }
}
