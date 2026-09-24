package com.example.backend.user;

import com.example.backend.common.mapper.DateTimeMapper;
import com.example.backend.generated.model.UserProfileResponseDto;
import com.example.backend.generated.model.UserResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        uses = DateTimeMapper.class,
        implementationName = "UserProfileMapperImpl",
        unmappedTargetPolicy = ReportingPolicy.ERROR
)
public interface UserMapper {

    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "instantToOffsetDateTime")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "instantToOffsetDateTime")
    @Mapping(target = "subscriptions", ignore = true)
    UserProfileResponseDto toUserProfileResponseDto(User user);

    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "instantToOffsetDateTime")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "instantToOffsetDateTime")
    UserResponseDto toUserResponseDto(User user);
}
