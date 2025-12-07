package com.employee.Emp.Service;

import com.employee.Emp.DTO.CategoryDTO;
import com.employee.Emp.Entity.Category;
import com.employee.Emp.Repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ModelMapper modelMapper;

    public List<CategoryDTO> findAll() {
        List<CategoryDTO> list = categoryRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
        return list;
    }

    public CategoryDTO findById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found: " + id));
        return toDTO(category);
    }

    public CategoryDTO create(CategoryDTO dto) {
        if (dto.getId() != null) dto.setId(null); // ensure new
        Category saved = categoryRepository.save(toEntity(dto));
        return toDTO(saved);
    }

    public CategoryDTO update(Long id, CategoryDTO dto) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found: " + id));
        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setIsActive(dto.getIsActive());
        existing.setSortOrder(dto.getSortOrder());
        existing.setParentId(dto.getParentId());
        existing.setImage(dto.getImage());
        Category saved = categoryRepository.save(existing);
        return toDTO(saved);
    }

    public void delete(Long id) {
        categoryRepository.deleteById(id);
    }

    private CategoryDTO toDTO(Category c) {
        CategoryDTO dto = modelMapper.map(c, CategoryDTO.class);
        dto.set_id(c.getId());
        // If you want product counts, set dto.setProductCount(...) here.
        return dto;
    }

    private Category toEntity(CategoryDTO dto) {
        return modelMapper.map(dto, Category.class);
    }
}