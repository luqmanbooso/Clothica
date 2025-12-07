package com.employee.Emp.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class CategoryDTO {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long _id;          // for frontend compatibility
    private String name;
    private String description;
    private Boolean isActive;
    private Integer sortOrder;
    private Long parentId;
    private String image;
    private Long productCount; // optional; populate if you need counts

    public CategoryDTO(String category, String category1, String category2, String s, boolean b, int i, long count) {
    }
}
