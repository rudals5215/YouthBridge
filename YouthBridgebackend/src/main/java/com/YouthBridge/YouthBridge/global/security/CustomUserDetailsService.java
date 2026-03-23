package com.YouthBridge.YouthBridge.global.security;

import com.YouthBridge.YouthBridge.domain.user.entity.User;
import com.YouthBridge.YouthBridge.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    // Spring Security가 인증할 때 이 메서드를 호출해요
    // 이메일로 유저를 찾아서 UserDetails 형태로 반환해요
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("유저를 찾을 수 없어요: " + email));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword() != null ? user.getPassword() : "")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole())))
                .build();
    }
}
