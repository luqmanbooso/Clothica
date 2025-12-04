package com.employee.Emp.Service;

import com.employee.Emp.DTO.ProductDTO;
import com.employee.Emp.Entity.Product;
import com.employee.Emp.Repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ModelMapper modelmapper;

    public List<ProductDTO> getAllProduct(){
        List<Product> pdo=productRepository.findAll();
        return modelmapper.map(pdo,new TypeToken<List<ProductDTO>>(){}.getType());
    }

    public ProductDTO getProductById(Long Id){
        Product product=productRepository.findById(Id)
                .orElseThrow(() -> new RuntimeException("Product not found with id"+Id));
        return modelmapper.map(product,ProductDTO.class);
    }

    public String saveProduct(ProductDTO productDTO){
        productRepository.save(modelmapper.map(productDTO,Product.class));
        return "Product "+productDTO.getName()+" saved successfully";
    }

//try updateProductByID later
    public ProductDTO updateProduct(Long Id,ProductDTO productDTO){
        Product existing=productRepository.findById(Id)
                        .orElseThrow(() -> new RuntimeException("Product not found with id"+Id));
        modelmapper.map(productDTO,existing); //copy field by field from DTO object to existing Entity object
        existing.setId(Id); // make sure ID is not changed from the body

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

}
