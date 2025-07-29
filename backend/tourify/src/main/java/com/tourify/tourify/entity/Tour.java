package com.tourify.tourify.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;

@Entity
@Table(name = "tours")
public class Tour {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title", length = 100, nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private TourStatus status = TourStatus.Draft;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "starting_point", length = 100)
    private String startingPoint;

    @Column(name = "estimated_cost", precision = 10, scale = 2)
    private BigDecimal estimatedCost;

    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    @Column(name = "finalized_at")
    private ZonedDateTime finalizedAt;

    public enum TourStatus {
        Draft, Planned, Upcoming, Ongoing, Completed, PUBLISHED, Cancelled
    }

    // Constructors
    public Tour() {}

    public Tour(User user, String title) {
        this.user = user;
        this.title = title;
        this.status = TourStatus.Draft;
    }

    public Tour(User user, String title, LocalDate startDate, LocalDate endDate, BigDecimal estimatedCost) {
        this.user = user;
        this.title = title;
        this.startDate = startDate;
        this.endDate = endDate;
        this.estimatedCost = estimatedCost;
        this.status = TourStatus.Draft;
    }

    // JPA lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        ZonedDateTime now = ZonedDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public TourStatus getStatus() {
        return status;
    }

    public void setStatus(TourStatus status) {
        this.status = status;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getStartingPoint() {
        return startingPoint;
    }

    public void setStartingPoint(String startingPoint) {
        this.startingPoint = startingPoint;
    }

    public BigDecimal getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(BigDecimal estimatedCost) {
        this.estimatedCost = estimatedCost;
    }

    public ZonedDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(ZonedDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public ZonedDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(ZonedDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public ZonedDateTime getFinalizedAt() {
        return finalizedAt;
    }

    public void setFinalizedAt(ZonedDateTime finalizedAt) {
        this.finalizedAt = finalizedAt;
    }

    public void markAsFinalized() {
        this.finalizedAt = ZonedDateTime.now();
    }

    public boolean isFinalized() {
        return finalizedAt != null;
    }

    @Override
    public String toString() {
        return "Tour{" +
                "id=" + id +
                ", user=" + (user != null ? user.getId() : null) +
                ", title='" + title + '\'' +
                ", status=" + status +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", estimatedCost=" + estimatedCost +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", finalizedAt=" + finalizedAt +
                '}';
    }
}
