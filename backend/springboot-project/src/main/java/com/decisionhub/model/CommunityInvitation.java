package com.decisionhub.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name = "community_invitations", uniqueConstraints = @UniqueConstraint(columnNames = {"community_id", "invitee_id", "status"}))
public class CommunityInvitation {
 @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) @JoinColumn(name="community_id") private Community community;
 @ManyToOne(optional=false) @JoinColumn(name="invitee_id") private User invitee;
 @ManyToOne(optional=false) @JoinColumn(name="inviter_id") private User inviter;
 @Column(nullable=false) private String status="PENDING";
 @Column(nullable=false, updatable=false) private LocalDateTime createdAt=LocalDateTime.now();
 public CommunityInvitation(){} public CommunityInvitation(Community c,User i,User by){community=c;invitee=i;inviter=by;}
 public Long getId(){return id;} public Community getCommunity(){return community;} public User getInvitee(){return invitee;} public User getInviter(){return inviter;} public String getStatus(){return status;} public void setStatus(String s){status=s;} public LocalDateTime getCreatedAt(){return createdAt;}
}
