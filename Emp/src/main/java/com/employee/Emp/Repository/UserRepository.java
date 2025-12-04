package com.employee.Emp.Repository;
import com.employee.Emp.Entity.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserInfo,Integer> {
    Optional<UserInfo> findByEmail(String email);
}
