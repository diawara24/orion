package com.example.backend.comment;

import com.example.backend.common.mapper.DateTimeMapper;
import com.example.backend.generated.model.AuthorResponseDto;
import com.example.backend.generated.model.CommentResponseDto;
import com.example.backend.user.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        uses = DateTimeMapper.class,
        unmappedTargetPolicy = ReportingPolicy.ERROR
)
public interface CommentMapper {

    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "instantToOffsetDateTime")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "instantToOffsetDateTime")
    CommentResponseDto toResponseDto(Comment comment);

    AuthorResponseDto toAuthorResponseDto(User user);
}
