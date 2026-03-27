package com.MyWebpage.register.login.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {
    @Autowired
    private JWTService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                Long farmerId = jwtService.extractFarmerId(token);

                if (farmerId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    String role = jwtService.extractRole(token);
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    farmerId,
                                    null,
                                    List.of(new SimpleGrantedAuthority("ROLE_" + role))
                            );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception ignored) {
                // Ignore malformed/expired token and continue without authentication.
            }
        }
        filterChain.doFilter(request, response);
    }
}

//         -//package com.MyWebpage.register.login.security.jwt;
//         -//
//         -//
//         -//import com.MyWebpage.register.login.security.service.MyUserDetailsService;
//         -//import jakarta.servlet.FilterChain;
//         -//import jakarta.servlet.ServletException;
//         -//import jakarta.servlet.http.HttpServletRequest;
//         -//import jakarta.servlet.http.HttpServletResponse;
//         -//import org.springframework.beans.factory.annotation.Autowired;
//         -//import org.springframework.context.ApplicationContext;
//         -//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//         -//import org.springframework.security.core.context.SecurityContextHolder;
//         -//import org.springframework.security.core.userdetails.UserDetails;
//         -//import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
//         -//import org.springframework.stereotype.Component;
//         -//import org.springframework.web.filter.OncePerRequestFilter;
//         -//
//         -//import java.io.IOException;
//         -//@Component
//         -//public class JwtFilter extends OncePerRequestFilter {
//         -//    @Autowired
//         -//    private JWTService jwtService;
//         -//
//         -//    @Autowired
//         -//    ApplicationContext applicationContext;
//         -//    @Override
//         -//    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
//         -//
//         -//        System.out.println("hii iam filter1");
//         -//        String authHeader=request.getHeader("Authorization");
//         -//        System.out.println(authHeader);
//         -//        String token=null;
//         -//        String username=null;
//         -//        if(authHeader !=null &&authHeader.startsWith("Bearer "))
//         -//        {
//         -//            System.out.println("hii iam filter2");
//         -//            token=authHeader.substring(7);
//         -//            username=jwtService.extractUsername(token);
//         -//        }
//         -//        System.out.println("cors"+SecurityContextHolder.getContext().getAuthentication());
//         -//        if(username!=null&& SecurityContextHolder.getContext().getAuthentication()==null)
//         -//        {
//         -//            System.out.println("hii iam filter3");
//         -//            UserDetails userDetails=applicationContext.getBean(MyUserDetailsService.class).loadUserByUsername(username);
//         -//
//         -//            if(jwtService.validateToken(token,userDetails))
//         -//            {
//         -//                System.out.println("hii iam filter4");
//         -//                UsernamePasswordAuthenticationToken authToken=new UsernamePasswordAuthenticationToken(userDetails,null,userDetails.getAuthorities());
//         -//                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
//         -//                SecurityContextHolder.getContext().setAuthentication(authToken);
//         -//
//         -//            }
//         -//        }
//         -//        filterChain.doFilter(request,response);
//         -//    }
//         -//}
