package com.MyWebpage.register.login.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserBlockRepository extends JpaRepository<UserBlock, Long> {
    Optional<UserBlock> findByBlockerIdAndBlockedId(Long blockerId, Long blockedId);

    boolean existsByBlockerIdAndBlockedId(Long blockerId, Long blockedId);

    void deleteByBlockerIdAndBlockedId(Long blockerId, Long blockedId);

    @Query("""
            SELECT (count(b) > 0) FROM UserBlock b
            WHERE (b.blockerId = :userA AND b.blockedId = :userB)
               OR (b.blockerId = :userB AND b.blockedId = :userA)
            """)
    boolean existsBetween(@Param("userA") Long userA, @Param("userB") Long userB);
}
