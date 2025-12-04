package com.employee.Emp.Controller;

import com.employee.Emp.DTO.ProductDTO;
import com.employee.Emp.Entity.Product;
import com.employee.Emp.Service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin
public class ProductController {

    @Autowired
    ProductService productService;

    @GetMapping("/")
    public List<ProductDTO> getProducts(){
      return productService.getAllProduct();
    }

    @GetMapping("/{id}")
    public ProductDTO getProductById(@PathVariable("id") Long Id){
        return productService.getProductById(Id);
    }

    @ResponseStatus(HttpStatus.CREATED) //    When this controller method runs successfully, return HTTP status 201 Created instead of the default 200 OK.
    @PostMapping("/")
    public String postProduct(@RequestBody ProductDTO productDTO){
        return productService.saveProduct(productDTO);
    }

//    @PutMapping("/{id}")
//    public ProductDTO updateUser(@PathVariable("id") Long Id,@RequestBody ProductDTO productDTO){
//        return productService.updateProduct(Id,productDTO);
//    }
//
//    @DeleteMapping("/{id}")
//    public boolean deleteUser(@PathVariable("id") Long ID){
//        return productService.deleteProduct(ID);
//    }


    @PutMapping("update/{productID}")
    public ProductDTO updateProduct(@PathVariable Long productID,@RequestBody ProductDTO productDTO){
        return productService.updateProduct(productID,productDTO);
    }

    @DeleteMapping("/{productID}")
    public boolean deletepProduct(@PathVariable Long productID){
        return productService.deleteProduct(productID);
    }
}
