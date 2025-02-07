//package com.MyWebpage.register.login.repositor;
//
//import com.MyWebpage.register.login.model.Buyer;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.stereotype.Repository;
//
//import java.util.Optional;
//
//@Repository
//public interface BuyerRepo extends JpaRepository<Buyer,Long> {
//    Buyer findByBuyerId(Long BuyerId);
//
//    Buyer findByEmail(String email);
//
//    Buyer findByUsername(String usernameOrEmail);
//
//    void deleteByBuyerId(Long buyerId);
//    @Query(value = "select next_val from buyer_sequence", nativeQuery = true)
//    Long getNextUserSequence();
//}
