package com.MyWebpage.register.login.common.navbar;

public class NavbarCountsDTO {
    private long unreadConversations;
    private long unreadRequests;
    private long unreadNotifications;

    public NavbarCountsDTO() {
    }

    public NavbarCountsDTO(long unreadConversations, long unreadRequests, long unreadNotifications) {
        this.unreadConversations = unreadConversations;
        this.unreadRequests = unreadRequests;
        this.unreadNotifications = unreadNotifications;
    }

    public long getUnreadConversations() {
        return unreadConversations;
    }

    public void setUnreadConversations(long unreadConversations) {
        this.unreadConversations = unreadConversations;
    }

    public long getUnreadRequests() {
        return unreadRequests;
    }

    public void setUnreadRequests(long unreadRequests) {
        this.unreadRequests = unreadRequests;
    }

    public long getUnreadNotifications() {
        return unreadNotifications;
    }

    public void setUnreadNotifications(long unreadNotifications) {
        this.unreadNotifications = unreadNotifications;
    }
}
