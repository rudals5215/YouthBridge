package com.YouthBridge.YouthBridge.domain.policy.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PolicyListRequest {

    private String region;
    private Integer age;
    private String category;
    private List<String> categories;
    private String keyword;
    private String status; // "ACTIVE" | "UPCOMING" | "CLOSED" | null(전체)
    private String sort = "latest";
    private int page = 0;
    private int size = 10;
}
