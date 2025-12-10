package com.employee.Emp.Repository;

import com.employee.Emp.Entity.UserInfo;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<UserInfo, Long> {
    Optional<UserInfo> findByEmail(String email);

    List<UserInfo> findByCreatedAtAfter(LocalDateTime startDate);
}
