package com.example.blog.model.Request;

import lombok.Data;

@Data
public class UserLoginRequest {
    private String username;
    private String password;
}