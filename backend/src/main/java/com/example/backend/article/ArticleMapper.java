package com.example.backend.article;

import com.example.backend.common.mapper.DateTimeMapper;
import com.example.backend.generated.model.ArticleDetailResponseDto;
import com.example.backend.generated.model.ArticleSummaryResponseDto;
import com.example.backend.generated.model.AuthorResponseDto;
import com.example.backend.generated.model.TopicResponseDto;
import com.example.backend.topic.Topic;
import com.example.backend.user.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        uses = DateTimeMapper.class,
        unmappedTargetPolicy = ReportingPolicy.ERROR
)
public interface ArticleMapper {

    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "instantToOffsetDateTime")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "instantToOffsetDateTime")
    @Mapping(target = "commentCount", ignore = true)
    ArticleDetailResponseDto toDetailResponseDto(Article article);

    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "instantToOffsetDateTime")
    ArticleSummaryResponseDto toSummaryResponseDto(Article article);

    AuthorResponseDto toAuthorResponseDto(User user);

    @Mapping(target = "subscribed", ignore = true)
    TopicResponseDto toTopicResponseDto(Topic topic);
}
