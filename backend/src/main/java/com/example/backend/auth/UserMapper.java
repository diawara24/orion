package com.example.backend.auth;

import com.example.backend.generated.model.UserResponseDto;
import com.example.backend.user.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Mapper(componentModel = "spring", unmappedTargetPolicy  = ReportingPolicy.ERROR)
public interface UserMapper {


    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "instantToOffsetDateTime")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "instantToOffsetDateTime")
    UserResponseDto toResponseDto(User user);

    @Named("instantToOffsetDateTime")
    default OffsetDateTime instantToOffsetDateTime(Instant instant) {
        return instant == null
                ? null
                : instant.atOffset(ZoneOffset.UTC);
    }
}
