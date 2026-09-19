package com.thinkstack.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;

    private String message;

    private T data;

    private String error;

    private long timestamp;

    public static <T> ApiResponse<T> ok(T data) {
        return of(true, "Success", data, null);
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        return of(true, message, data, null);
    }

    public static <T> ApiResponse<T> error(String message) {
        return of(false, "Error", null, message);
    }

    public static <T> ApiResponse<T> error(String message, String error) {
        return of(false, message, null, error);
    }

    private static <T> ApiResponse<T> of(boolean success, String message, T data, String error) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = success;
        response.message = message;
        response.data = data;
        response.error = error;
        response.timestamp = Instant.now().toEpochMilli();
        return response;
    }
}
