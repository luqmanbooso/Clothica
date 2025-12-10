package com.employee.Emp.Service;

import com.employee.Emp.DTO.ProductDTO;
import com.employee.Emp.DTO.CategoryDTO;
import com.employee.Emp.Entity.Product;
import com.employee.Emp.Repository.ProductRepository;
import org.springframework.transaction.annotation.Transactional;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Transactional
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ModelMapper modelmapper;

    public List<ProductDTO> getAllProduct(){
        List<Product> pdo=productRepository.findAll();
        List<ProductDTO> dtoList = modelmapper.map(pdo,new TypeToken<List<ProductDTO>>(){}.getType());
        dtoList.forEach(this::normalizeProductDTO);
        return dtoList;
    }

    public ProductDTO getProductById(Long Id){
        Product product=productRepository.findById(Id)
                .orElseThrow(() -> new RuntimeException("Product not found with id"+Id));
        ProductDTO dto = modelmapper.map(product,ProductDTO.class);
        normalizeProductDTO(dto);
        return dto;
    }

    public String saveProduct(ProductDTO productDTO){
        Product product = modelmapper.map(productDTO,Product.class);
        applyDefaults(product);
        productRepository.save(product);
        return "Product "+productDTO.getName()+" saved successfully";
    }

//try updateProductByID later
    public ProductDTO updateProduct(Long Id,ProductDTO productDTO){
        Product existing=productRepository.findById(Id)
                        .orElseThrow(() -> new RuntimeException("Product not found with id"+Id));
        modelmapper.map(productDTO,existing); //copy field by field from DTO object to existing Entity object
        existing.setId(Id); // make sure ID is not changed from the body
        applyDefaults(existing);

        Product updated = productRepository.save(existing);
        return modelmapper.map(existing,ProductDTO.class);
    }

    public boolean deleteProduct(Long Id){
        if (!productRepository.existsById(Id)){
            throw new RuntimeException("Product not found with ID"+Id);
        }
        productRepository.deleteById(Id);
        System.out.println("Product Deleted Successfully");
        return true;
    }

    private void applyDefaults(Product product){
        if(product.getDiscount() == null){
            product.setDiscount(0);
        }
        if(product.getRating() == null){
            product.setRating(0.0);
        }
        if(product.getIsNew() == null){
            product.setIsNew(false);
        }
        if(product.getCreatedAt() == null){
            product.setCreatedAt(java.time.LocalDateTime.now());
        }
        if(product.getImages() == null){
            product.setImages(new java.util.ArrayList<>());
        }
    }

    private void normalizeProductDTO(ProductDTO dto){
        dto.set_id(dto.getId());
        if(dto.getDiscount() == null){
            dto.setDiscount(0);
        }
        if(dto.getRating() == null){
            dto.setRating(0.0);
        }
        if(dto.getIsNew() == null){
            dto.setIsNew(false);
        }
        if(dto.getCreatedAt() == null){
            dto.setCreatedAt(java.time.LocalDateTime.now());
        }
        if(dto.getImages() == null){
            dto.setImages(new java.util.ArrayList<>());
        }
    }

    public List<CategoryDTO> getCategorySummaries(){
        List<ProductRepository.CategoryCount> counts = productRepository.findCategoryCounts();
        return counts.stream()
                .map(c -> new CategoryDTO(
                        c.getCategory(),
                        c.getCategory(),
                        c.getCategory(),
                        "",
                        true,
                        0,
                        c.getCount()
                ))
                .collect(Collectors.toList());
    }

    public java.util.Map<String, Long> getCategoryCounts(){
        List<ProductRepository.CategoryCount> counts = productRepository.findCategoryCounts();
        long total = counts.stream().mapToLong(ProductRepository.CategoryCount::getCount).sum();
        java.util.Map<String, Long> response = new java.util.HashMap<>();
        response.put("all", total);
        for(ProductRepository.CategoryCount c : counts){
            response.put(c.getCategory(), c.getCount());
        }
        return response;
    }

}
