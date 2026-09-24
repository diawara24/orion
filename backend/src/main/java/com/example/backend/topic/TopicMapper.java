package com.example.backend.topic;

import com.example.backend.common.mapper.DateTimeMapper;
import com.example.backend.generated.model.TopicAdminResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        uses = DateTimeMapper.class,
        unmappedTargetPolicy = ReportingPolicy.ERROR
)
public interface TopicMapper {

    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "instantToOffsetDateTime")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "instantToOffsetDateTime")
    TopicAdminResponseDto toAdminResponseDto(Topic topic);
}
