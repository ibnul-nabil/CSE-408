package com.tourify.tourify.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "transport_stops")
public class TransportStop {
    
    @EmbeddedId
    private TransportStopId id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("transportId")
    @JoinColumn(name = "transport_id")
    private Transport transport;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("stopId")
    @JoinColumn(name = "stop_id")
    private Destination stop;
    
    @Column(name = "cumulative_price", precision = 10, scale = 2)
    private BigDecimal cumulativePrice;
    
    // Constructors
    public TransportStop() {}
    
    public TransportStop(Transport transport, Destination stop, BigDecimal cumulativePrice) {
        this.id = new TransportStopId(transport.getId(), stop.getId());
        this.transport = transport;
        this.stop = stop;
        this.cumulativePrice = cumulativePrice;
    }
    
    // Getters and Setters
    public TransportStopId getId() {
        return id;
    }
    
    public void setId(TransportStopId id) {
        this.id = id;
    }
    
    public Transport getTransport() {
        return transport;
    }
    
    public void setTransport(Transport transport) {
        this.transport = transport;
    }
    
    public Destination getStop() {
        return stop;
    }
    
    public void setStop(Destination stop) {
        this.stop = stop;
    }
    
    public BigDecimal getCumulativePrice() {
        return cumulativePrice;
    }
    
    public void setCumulativePrice(BigDecimal cumulativePrice) {
        this.cumulativePrice = cumulativePrice;
    }
    
    // Embedded ID class
    @Embeddable
    public static class TransportStopId implements java.io.Serializable {
        
        @Column(name = "transport_id")
        private Long transportId;
        
        @Column(name = "stop_id")
        private Long stopId;
        
        public TransportStopId() {}
        
        public TransportStopId(Long transportId, Long stopId) {
            this.transportId = transportId;
            this.stopId = stopId;
        }
        
        public Long getTransportId() {
            return transportId;
        }
        
        public void setTransportId(Long transportId) {
            this.transportId = transportId;
        }
        
        public Long getStopId() {
            return stopId;
        }
        
        public void setStopId(Long stopId) {
            this.stopId = stopId;
        }
        
        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            
            TransportStopId that = (TransportStopId) o;
            
            if (transportId != null ? !transportId.equals(that.transportId) : that.transportId != null) return false;
            return stopId != null ? stopId.equals(that.stopId) : that.stopId == null;
        }
        
        @Override
        public int hashCode() {
            int result = transportId != null ? transportId.hashCode() : 0;
            result = 31 * result + (stopId != null ? stopId.hashCode() : 0);
            return result;
        }
    }
} 