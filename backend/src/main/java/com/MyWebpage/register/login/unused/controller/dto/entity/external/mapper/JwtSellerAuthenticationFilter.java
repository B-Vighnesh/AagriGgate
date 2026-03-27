//package com.MyWebpage.register.login.JWT;
//
//import com.MyWebpage.register.login.security.UserPrincipal;
//import com.MyWebpage.register.login.service.MyUserDetailsService;
//import io.jsonwebtoken.Claims;
//import io.jsonwebtoken.Jwts;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import java.io.IOException;
//
//public class JwtSellerAuthenticationFilter extends OncePerRequestFilter {
//
//    private final String JWT_SECRET = "your_jwt_secret"; // Use a strong secret key
//    private final MyUserDetailsService userDetailsService;
//
//    public JwtSellerAuthenticationFilter(MyUserDetailsService userDetailsService) {
//        this.userDetailsService = userDetailsService;
//    }
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
//            throws ServletException, IOException {
//        String jwt = getJwtFromRequest(request);
//
//        if (jwt != null && validateToken(jwt)) {
//            String username = getUsernameFromJwt(jwt);
//            UserPrincipal userPrincipal = (UserPrincipal) userDetailsService.loadUserByUsername(username);
//
//            if (userPrincipal != null) {
//                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
//                        userPrincipal,
//                        null,
//                        userPrincipal.getAuthorities()
//                );
//
//                // Set the details of the authentication object
//                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
//                SecurityContextHolder.getContext().setAuthentication(authentication);
//            }
//        }
//
//        filterChain.doFilter(request, response);
//    }
//
//    private String getJwtFromRequest(HttpServletRequest request) {
//        String bearerToken = request.getHeader("Authorization");
//        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
//            return bearerToken.substring(7);
//        }
//        return null;
//    }
//
//    private boolean validateToken(String token) {
//        try {
//            Jwts.parser().setSigningKey(JWT_SECRET).parseClaimsJws(token);
//            return true;
//        } catch (Exception e) {
//            // Log the exception for debugging
//            return false;
//        }
//    }
//
//    private String getUsernameFromJwt(String token) {
//        Claims claims = Jwts.parser().setSigningKey(JWT_SECRET).parseClaimsJws(token).getBody();
//        return claims.getSubject();
//    }
//}
