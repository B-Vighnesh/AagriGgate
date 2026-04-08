package com.MyWebpage.register.login.support;

import com.MyWebpage.register.login.support.dto.SupportRequestImageDTO;
import com.MyWebpage.register.login.support.dto.SupportRequestSummaryDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SupportRequestRepository extends JpaRepository<SupportRequest, Long> {

    long countByEmailAndIsDeletedFalse(String email);

    @Query("""
            SELECT new com.MyWebpage.register.login.support.dto.SupportRequestSummaryDTO(
                s.id,
                s.userId,
                s.name,
                s.email,
                s.type,
                s.subject,
                s.message,
                s.status,
                s.isDeleted,
                s.createdAt,
                s.updatedAt
            )
            FROM SupportRequest s
            WHERE s.isDeleted = false
            ORDER BY s.createdAt DESC
            """)
    List<SupportRequestSummaryDTO> findAllSummaries();

    @Query("""
            SELECT new com.MyWebpage.register.login.support.dto.SupportRequestSummaryDTO(
                s.id,
                s.userId,
                s.name,
                s.email,
                s.type,
                s.subject,
                s.message,
                s.status,
                s.isDeleted,
                s.createdAt,
                s.updatedAt
            )
            FROM SupportRequest s
            WHERE s.id = :id
              AND s.isDeleted = false
            """)
    Optional<SupportRequestSummaryDTO> findSummaryById(@Param("id") Long id);

    @Query("""
            SELECT new com.MyWebpage.register.login.support.dto.SupportRequestImageDTO(
                s.id,
                s.imageData,
                s.imageName,
                s.imageType
            )
            FROM SupportRequest s
            WHERE s.id = :id
              AND s.isDeleted = false
            """)
    Optional<SupportRequestImageDTO> findImageById(@Param("id") Long id);

    @Transactional
    @Modifying
    @Query("""
            UPDATE SupportRequest s
            SET s.isDeleted = true,
                s.updatedAt = :updatedAt
            WHERE s.id = :id
              AND s.isDeleted = false
            """)
    int softDeleteById(@Param("id") Long id, @Param("updatedAt") LocalDateTime updatedAt);
}
