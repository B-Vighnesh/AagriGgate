package com.MyWebpage.register.login.news.controller;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;

@Disabled("Test skeleton pending implementation")
class NewsControllerSecurityTest {

    private MockMvc mockMvc;

    @Test
    void shouldReturnUnauthorizedForAnonymousNewsFeedAccess() throws Exception {
        // TODO implement MockMvc verification for anonymous 401 on GET /api/v1/news
    }

    @Test
    void shouldAllowAuthenticatedBuyerToAccessNewsFeed() throws Exception {
        // TODO implement MockMvc verification for BUYER access on GET /api/v1/news
    }

    @Test
    void shouldAllowAuthenticatedSellerToAccessNewsFeed() throws Exception {
        // TODO implement MockMvc verification for SELLER access on GET /api/v1/news
    }
}
