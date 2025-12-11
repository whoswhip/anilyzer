import { sqliteTable, index } from 'drizzle-orm/sqlite-core';
import 'dotenv/config';

export const series = (() => {
	if (process.env.DATABASE_FULL !== 'true') {
		return sqliteTable(
			'series',
			(t) => ({
				id: t.integer('id').primaryKey(),
				state: t.text('state'),
				mergedWith: t.integer('merged_with'),
				title: t.text('title'),
				nativeTitle: t.text('native_title'),
				romanizedTitle: t.text('romanized_title'),
				secondaryTitlesEn: t.text('secondary_titles_en'),
				coverRawUrl: t.text('cover_raw_url'),
				coverRawSize: t.integer('cover_raw_size'),
				coverRawWidth: t.integer('cover_raw_width'),
				coverRawFormat: t.text('cover_raw_format'),
				coverRawHeight: t.integer('cover_raw_height'),
				coverRawBlurhash: t.text('cover_raw_blurhash'),
				coverRawThumbhash: t.text('cover_raw_thumbhash'),
				coverX150X1: t.text('cover_x150_x1'),
				coverX150X2: t.text('cover_x150_x2'),
				coverX150X3: t.text('cover_x150_x3'),
				coverX250X1: t.text('cover_x250_x1'),
				coverX250X2: t.text('cover_x250_x2'),
				coverX250X3: t.text('cover_x250_x3'),
				coverX350X1: t.text('cover_x350_x1'),
				coverX350X2: t.text('cover_x350_x2'),
				coverX350X3: t.text('cover_x350_x3'),
				authors: t.text('authors'),
				artists: t.text('artists'),
				description: t.text('description'),
				year: t.integer('year'),
				status: t.text('status'),
				isLicensed: t.integer('is_licensed'),
				hasAnime: t.integer('has_anime'),
				anime: t.text('anime'),
				contentRating: t.text('content_rating'),
				type: t.text('type'),
				rating: t.integer('rating'),
				finalVolume: t.text('final_volume'),
				finalChapter: t.text('final_chapter'),
				totalChapters: t.text('total_chapters'),
				links: t.text('links'),
				publishers: t.text('publishers'),
				relationships: t.text('relationships'),
				genres: t.text('genres'),
				genresV2: t.text('genres_v2'),
				tags: t.text('tags'),
				tagsV2: t.text('tags_v2'),
				lastUpdatedAt: t.text('last_updated_at'),
				sourceAnilistId: t.text('source_anilist_id'),
				sourceAnilistRating: t.text('source_anilist_rating'),
				sourceAnilistRatingNormalized: t.text('source_anilist_rating_normalized'),
				sourceAnilistCover: t.text('source_anilist_cover'),
				sourceAnilistLastUpdatedAt: t.text('source_anilist_last_updated_at'),
				sourceAnilistResponse: t.text('source_anilist_response'),
				sourceAnimePlanetId: t.text('source_anime_planet_id'),
				sourceAnimePlanetRating: t.real('source_anime_planet_rating'),
				sourceAnimePlanetRatingNormalized: t.integer('source_anime_planet_rating_normalized'),
				sourceAnimePlanetCover: t.text('source_anime_planet_cover'),
				sourceAnimePlanetLastUpdatedAt: t.text('source_anime_planet_last_updated_at'),
				sourceAnimePlanetResponse: t.text('source_anime_planet_response'),
				sourceShikimoriId: t.text('source_shikimori_id'),
				sourceShikimoriRating: t.text('source_shikimori_rating'),
				sourceShikimoriRatingNormalized: t.text('source_shikimori_rating_normalized'),
				sourceShikimoriCover: t.text('source_shikimori_cover'),
				sourceShikimoriLastUpdatedAt: t.text('source_shikimori_last_updated_at'),
				sourceShikimoriResponse: t.text('source_shikimori_response'),
				sourceAnimeNewsNetworkId: t.text('source_anime_news_network_id'),
				sourceAnimeNewsNetworkRating: t.text('source_anime_news_network_rating'),
				sourceAnimeNewsNetworkRatingNormalized: t.text(
					'source_anime_news_network_rating_normalized'
				),
				sourceAnimeNewsNetworkCover: t.text('source_anime_news_network_cover'),
				sourceAnimeNewsNetworkLastUpdatedAt: t.text('source_anime_news_network_last_updated_at'),
				sourceAnimeNewsNetworkResponse: t.text('source_anime_news_network_response'),
				sourceMangaUpdatesId: t.text('source_manga_updates_id'),
				sourceMangaUpdatesRating: t.text('source_manga_updates_rating'),
				sourceMangaUpdatesRatingNormalized: t.text('source_manga_updates_rating_normalized'),
				sourceMangaUpdatesCover: t.text('source_manga_updates_cover'),
				sourceMangaUpdatesLastUpdatedAt: t.text('source_manga_updates_last_updated_at'),
				sourceMangaUpdatesResponse: t.text('source_manga_updates_response'),
				sourceMyAnimeListId: t.text('source_my_anime_list_id'),
				sourceMyAnimeListRating: t.text('source_my_anime_list_rating'),
				sourceMyAnimeListRatingNormalized: t.text('source_my_anime_list_rating_normalized'),
				sourceMyAnimeListCover: t.text('source_my_anime_list_cover'),
				sourceMyAnimeListLastUpdatedAt: t.text('source_my_anime_list_last_updated_at'),
				sourceMyAnimeListResponse: t.text('source_my_anime_list_response'),
				sourceKitsuId: t.text('source_kitsu_id'),
				sourceKitsuRating: t.text('source_kitsu_rating'),
				sourceKitsuRatingNormalized: t.text('source_kitsu_rating_normalized'),
				sourceKitsuCover: t.text('source_kitsu_cover'),
				sourceKitsuLastUpdatedAt: t.text('source_kitsu_last_updated_at'),
				sourceKitsuResponse: t.text('source_kitsu_response'),
				relationshipsAlternative: t.text('relationships_alternative'),
				relationshipsMainStory: t.text('relationships_main_story'),
				relationshipsPrequel: t.text('relationships_prequel'),
				relationshipsSequel: t.text('relationships_sequel'),
				relationshipsOther: t.text('relationships_other'),
				animeEnd: t.text('anime_end'),
				animeStart: t.text('anime_start'),
				relationshipsSpinOff: t.text('relationships_spin_off'),
				relationshipsAdaptation: t.text('relationships_adaptation'),
				relationshipsSideStory: t.text('relationships_side_story'),
				secondaryTitlesJaRo: t.text('secondary_titles_ja-ro'),
				secondaryTitlesJa: t.text('secondary_titles_ja'),
				secondaryTitlesVi: t.text('secondary_titles_vi'),
				secondaryTitlesZh: t.text('secondary_titles_zh'),
				secondaryTitlesPtBr: t.text('secondary_titles_pt-br'),
				secondaryTitlesTh: t.text('secondary_titles_th'),
				secondaryTitlesEs: t.text('secondary_titles_es'),
				secondaryTitlesPt: t.text('secondary_titles_pt'),
				secondaryTitlesZhRo: t.text('secondary_titles_zh-ro'),
				secondaryTitlesZhHk: t.text('secondary_titles_zh-hk'),
				secondaryTitlesKo: t.text('secondary_titles_ko'),
				secondaryTitlesFr: t.text('secondary_titles_fr'),
				secondaryTitlesKoRo: t.text('secondary_titles_ko-ro'),
				secondaryTitlesEsLa: t.text('secondary_titles_es-la'),
				secondaryTitlesDe: t.text('secondary_titles_de'),
				secondaryTitlesRu: t.text('secondary_titles_ru')
			}),
			(table) => [index('source_anilist_id_idx').on(table.sourceAnilistId)]
		);
	} else if (process.env.DATABASE_FULL === 'true' && process.env.DATABASE_FULL_URL) {
		return sqliteTable(
			'series',
			(t) => ({
				id: t.integer('id').primaryKey(),
				state: t.text('state'),
				mergedWith: t.integer('merged_with'),
				title: t.text('title'),
				nativeTitle: t.text('native_title'),
				romanizedTitle: t.text('romanized_title'),
				secondaryTitlesEn: t.text('secondary_titles_en'),
				coverRawUrl: t.text('cover_raw_url'),
				coverRawSize: t.integer('cover_raw_size'),
				coverRawWidth: t.integer('cover_raw_width'),
				coverRawFormat: t.text('cover_raw_format'),
				coverRawHeight: t.integer('cover_raw_height'),
				coverRawBlurhash: t.text('cover_raw_blurhash'),
				coverRawThumbhash: t.text('cover_raw_thumbhash'),
				coverX150X1: t.text('cover_x150_x1'),
				coverX150X2: t.text('cover_x150_x2'),
				coverX150X3: t.text('cover_x150_x3'),
				coverX250X1: t.text('cover_x250_x1'),
				coverX250X2: t.text('cover_x250_x2'),
				coverX250X3: t.text('cover_x250_x3'),
				coverX350X1: t.text('cover_x350_x1'),
				coverX350X2: t.text('cover_x350_x2'),
				coverX350X3: t.text('cover_x350_x3'),
				authors: t.text('authors'),
				artists: t.text('artists'),
				description: t.text('description'),
				year: t.integer('year'),
				status: t.text('status'),
				isLicensed: t.integer('is_licensed'),
				hasAnime: t.integer('has_anime'),
				anime: t.text('anime'),
				contentRating: t.text('content_rating'),
				type: t.text('type'),
				rating: t.integer('rating'),
				finalVolume: t.text('final_volume'),
				finalChapter: t.text('final_chapter'),
				totalChapters: t.text('total_chapters'),
				links: t.text('links'),
				publishers: t.text('publishers'),
				relationships: t.text('relationships'),
				genres: t.text('genres'),
				genresV2: t.text('genres_v2'),
				tags: t.text('tags'),
				tagsV2: t.text('tags_v2'),
				lastUpdatedAt: t.text('last_updated_at'),
				sourceAnilistId: t.text('source_anilist_id'),
				sourceAnilistRating: t.text('source_anilist_rating'),
				sourceAnilistRatingNormalized: t.text('source_anilist_rating_normalized'),
				sourceAnilistCover: t.text('source_anilist_cover'),
				sourceAnilistLastUpdatedAt: t.text('source_anilist_last_updated_at'),
				sourceAnilistResponse: t.text('source_anilist_response'),
				sourceAnimePlanetId: t.text('source_anime_planet_id'),
				sourceAnimePlanetRating: t.real('source_anime_planet_rating'),
				sourceAnimePlanetRatingNormalized: t.integer('source_anime_planet_rating_normalized'),
				sourceAnimePlanetCover: t.text('source_anime_planet_cover'),
				sourceAnimePlanetLastUpdatedAt: t.text('source_anime_planet_last_updated_at'),
				sourceAnimePlanetResponse: t.text('source_anime_planet_response'),
				sourceShikimoriId: t.text('source_shikimori_id'),
				sourceShikimoriRating: t.text('source_shikimori_rating'),
				sourceShikimoriRatingNormalized: t.text('source_shikimori_rating_normalized'),
				sourceShikimoriCover: t.text('source_shikimori_cover'),
				sourceShikimoriLastUpdatedAt: t.text('source_shikimori_last_updated_at'),
				sourceShikimoriResponse: t.text('source_shikimori_response'),
				sourceAnimeNewsNetworkId: t.text('source_anime_news_network_id'),
				sourceAnimeNewsNetworkRating: t.text('source_anime_news_network_rating'),
				sourceAnimeNewsNetworkRatingNormalized: t.text(
					'source_anime_news_network_rating_normalized'
				),
				sourceAnimeNewsNetworkCover: t.text('source_anime_news_network_cover'),
				sourceAnimeNewsNetworkLastUpdatedAt: t.text('source_anime_news_network_last_updated_at'),
				sourceAnimeNewsNetworkResponse: t.text('source_anime_news_network_response'),
				sourceMangaUpdatesId: t.text('source_manga_updates_id'),
				sourceMangaUpdatesRating: t.text('source_manga_updates_rating'),
				sourceMangaUpdatesRatingNormalized: t.text('source_manga_updates_rating_normalized'),
				sourceMangaUpdatesCover: t.text('source_manga_updates_cover'),
				sourceMangaUpdatesLastUpdatedAt: t.text('source_manga_updates_last_updated_at'),
				sourceMangaUpdatesResponse: t.text('source_manga_updates_response'),
				sourceMyAnimeListId: t.text('source_my_anime_list_id'),
				sourceMyAnimeListRating: t.text('source_my_anime_list_rating'),
				sourceMyAnimeListRatingNormalized: t.text('source_my_anime_list_rating_normalized'),
				sourceMyAnimeListCover: t.text('source_my_anime_list_cover'),
				sourceMyAnimeListLastUpdatedAt: t.text('source_my_anime_list_last_updated_at'),
				sourceMyAnimeListResponse: t.text('source_my_anime_list_response'),
				sourceKitsuId: t.integer('source_kitsu_id'),
				sourceKitsuRating: t.text('source_kitsu_rating'),
				sourceKitsuRatingNormalized: t.text('source_kitsu_rating_normalized'),
				sourceKitsuCover: t.text('source_kitsu_cover'),
				sourceKitsuLastUpdatedAt: t.text('source_kitsu_last_updated_at'),
				sourceKitsuResponseId: t.integer('source_kitsu_response_id'),
				sourceKitsuResponseSfw: t.integer('source_kitsu_response_sfw'),
				sourceKitsuResponseTba: t.text('source_kitsu_response_tba'),
				sourceKitsuResponseSlug: t.text('source_kitsu_response_slug'),
				sourceKitsuResponseType: t.text('source_kitsu_response_type'),
				sourceKitsuResponseStaffNodes: t.text('source_kitsu_response_staff_nodes'),
				sourceKitsuResponseStatus: t.text('source_kitsu_response_status'),
				sourceKitsuResponseTitlesOriginal: t.text('source_kitsu_response_titles_original'),
				sourceKitsuResponseTitlesCanonical: t.text('source_kitsu_response_titles_canonical'),
				sourceKitsuResponseTitlesPreferred: t.text('source_kitsu_response_titles_preferred'),
				sourceKitsuResponseTitlesRomanized: t.text('source_kitsu_response_titles_romanized'),
				sourceKitsuResponseTitlesTranslated: t.text('source_kitsu_response_titles_translated'),
				sourceKitsuResponseTitlesAlternatives: t.text('source_kitsu_response_titles_alternatives'),
				sourceKitsuResponseTitlesOriginalLocale: t.text(
					'source_kitsu_response_titles_originalLocale'
				),
				sourceKitsuResponseTitlesCanonicalLocale: t.text(
					'source_kitsu_response_titles_canonicalLocale'
				),
				sourceKitsuResponseTitlesRomanizedLocale: t.text(
					'source_kitsu_response_titles_romanizedLocale'
				),
				sourceKitsuResponseTitlesTranslatedLocale: t.text(
					'source_kitsu_response_titles_translatedLocale'
				),
				sourceKitsuResponseEndDate: t.text('source_kitsu_response_endDate'),
				sourceKitsuResponseSubtype: t.text('source_kitsu_response_subtype'),
				sourceKitsuResponseMappingsNodes: t.text('source_kitsu_response_mappings_nodes'),
				sourceKitsuResponseAgeRating: t.text('source_kitsu_response_ageRating'),
				sourceKitsuResponseCreatedAt: t.text('source_kitsu_response_createdAt'),
				sourceKitsuResponseStartDate: t.text('source_kitsu_response_startDate'),
				sourceKitsuResponseUpdatedAt: t.text('source_kitsu_response_updatedAt'),
				sourceKitsuResponseUserCount: t.integer('source_kitsu_response_userCount'),
				sourceKitsuResponseCategoriesNodes: t.text('source_kitsu_response_categories_nodes'),
				sourceKitsuResponseBannerImage: t.text('source_kitsu_response_bannerImage'),
				sourceKitsuResponseDescriptionEn: t.text('source_kitsu_response_description_en'),
				sourceKitsuResponsePosterImageViews: t.text('source_kitsu_response_posterImage_views'),
				sourceKitsuResponsePosterImageBlurhash: t.text(
					'source_kitsu_response_posterImage_blurhash'
				),
				sourceKitsuResponsePosterImageOriginalUrl: t.text(
					'source_kitsu_response_posterImage_original_url'
				),
				sourceKitsuResponsePosterImageOriginalName: t.text(
					'source_kitsu_response_posterImage_original_name'
				),
				sourceKitsuResponsePosterImageOriginalWidth: t.integer(
					'source_kitsu_response_posterImage_original_width'
				),
				sourceKitsuResponsePosterImageOriginalHeight: t.integer(
					'source_kitsu_response_posterImage_original_height'
				),
				sourceKitsuResponseVolumeCount: t.text('source_kitsu_response_volumeCount'),
				sourceKitsuResponseChapterCount: t.integer('source_kitsu_response_chapterCount'),
				sourceKitsuResponseAverageRating: t.text('source_kitsu_response_averageRating'),
				sourceKitsuResponseRelationshipsNodes: t.text('source_kitsu_response_relationships_nodes'),
				sourceKitsuResponseUserCountRank: t.integer('source_kitsu_response_userCountRank'),
				sourceKitsuResponseAgeRatingGuide: t.text('source_kitsu_response_ageRatingGuide'),
				sourceKitsuResponseFavoritesCount: t.integer('source_kitsu_response_favoritesCount'),
				sourceKitsuResponseOriginCountries: t.text('source_kitsu_response_originCountries'),
				sourceKitsuResponseOriginLanguages: t.text('source_kitsu_response_originLanguages'),
				sourceKitsuResponseAverageRatingRank: t.text('source_kitsu_response_averageRatingRank'),
				sourceKitsuResponseChapterCountGuess: t.text('source_kitsu_response_chapterCountGuess'),
				sourceAnimePlanetResponseId: t.text('source_anime_planet_response_id'),
				sourceAnimePlanetResponseHref: t.text('source_anime_planet_response_href'),
				sourceAnimePlanetResponseTags: t.text('source_anime_planet_response_tags'),
				sourceAnimePlanetResponseType: t.text('source_anime_planet_response_type'),
				sourceAnimePlanetResponseYear: t.integer('source_anime_planet_response_year'),
				sourceAnimePlanetResponseTitle: t.text('source_anime_planet_response_title'),
				sourceAnimePlanetResponseRating: t.real('source_anime_planet_response_rating'),
				sourceAnimePlanetResponseStatus: t.text('source_anime_planet_response_status'),
				sourceAnimePlanetResponseChapters: t.text('source_anime_planet_response_chapters'),
				sourceAnimePlanetResponseImgFull: t.text('source_anime_planet_response_img_full'),
				sourceAnimePlanetResponseDescription: t.text('source_anime_planet_response_description'),
				sourceAnimePlanetResponseImgThumbnail: t.text('source_anime_planet_response_img_thumbnail'),
				sourceKitsuResponse: t.text('source_kitsu_response'),
				sourceAnimePlanetResponseVolumes: t.text('source_anime_planet_response_volumes'),
				relationshipsSequel: t.text('relationships_sequel'),
				sourceMangaUpdatesResponseUrl: t.text('source_manga_updates_response_url'),
				sourceMangaUpdatesResponseRankListsWish: t.integer(
					'source_manga_updates_response_rank_lists_wish'
				),
				sourceMangaUpdatesResponseRankListsCustom: t.integer(
					'source_manga_updates_response_rank_lists_custom'
				),
				sourceMangaUpdatesResponseRankListsReading: t.integer(
					'source_manga_updates_response_rank_lists_reading'
				),
				sourceMangaUpdatesResponseRankListsComplete: t.integer(
					'source_manga_updates_response_rank_lists_complete'
				),
				sourceMangaUpdatesResponseRankListsUnfinished: t.integer(
					'source_manga_updates_response_rank_lists_unfinished'
				),
				sourceMangaUpdatesResponseRankPositionWeek: t.integer(
					'source_manga_updates_response_rank_position_week'
				),
				sourceMangaUpdatesResponseRankPositionYear: t.integer(
					'source_manga_updates_response_rank_position_year'
				),
				sourceMangaUpdatesResponseRankPositionMonth: t.integer(
					'source_manga_updates_response_rank_position_month'
				),
				sourceMangaUpdatesResponseRankPositionSixMonths: t.integer(
					'source_manga_updates_response_rank_position_six_months'
				),
				sourceMangaUpdatesResponseRankPositionThreeMonths: t.integer(
					'source_manga_updates_response_rank_position_three_months'
				),
				sourceMangaUpdatesResponseRankOldPositionWeek: t.integer(
					'source_manga_updates_response_rank_old_position_week'
				),
				sourceMangaUpdatesResponseRankOldPositionYear: t.integer(
					'source_manga_updates_response_rank_old_position_year'
				),
				sourceMangaUpdatesResponseRankOldPositionMonth: t.integer(
					'source_manga_updates_response_rank_old_position_month'
				),
				sourceMangaUpdatesResponseRankOldPositionSixMonths: t.integer(
					'source_manga_updates_response_rank_old_position_six_months'
				),
				sourceMangaUpdatesResponseRankOldPositionThreeMonths: t.integer(
					'source_manga_updates_response_rank_old_position_three_months'
				),
				sourceMangaUpdatesResponseType: t.text('source_manga_updates_response_type'),
				sourceMangaUpdatesResponseYear: t.text('source_manga_updates_response_year'),
				sourceMangaUpdatesResponseAnimeEnd: t.text('source_manga_updates_response_anime_end'),
				sourceMangaUpdatesResponseAnimeStart: t.text('source_manga_updates_response_anime_start'),
				sourceMangaUpdatesResponseImageUrlThumb: t.text(
					'source_manga_updates_response_image_url_thumb'
				),
				sourceMangaUpdatesResponseImageUrlOriginal: t.text(
					'source_manga_updates_response_image_url_original'
				),
				sourceMangaUpdatesResponseImageWidth: t.integer(
					'source_manga_updates_response_image_width'
				),
				sourceMangaUpdatesResponseImageHeight: t.integer(
					'source_manga_updates_response_image_height'
				),
				sourceMangaUpdatesResponseTitle: t.text('source_manga_updates_response_title'),
				sourceMangaUpdatesResponseGenres: t.text('source_manga_updates_response_genres'),
				sourceMangaUpdatesResponseStatus: t.text('source_manga_updates_response_status'),
				sourceMangaUpdatesResponseAuthors: t.text('source_manga_updates_response_authors'),
				sourceMangaUpdatesResponseForumId: t.integer('source_manga_updates_response_forum_id'),
				sourceMangaUpdatesResponseLicensed: t.integer('source_manga_updates_response_licensed'),
				sourceMangaUpdatesResponseCompleted: t.integer('source_manga_updates_response_completed'),
				sourceMangaUpdatesResponseSeriesId: t.integer('source_manga_updates_response_series_id'),
				sourceMangaUpdatesResponseAssociated: t.text('source_manga_updates_response_associated'),
				sourceMangaUpdatesResponseCategories: t.text('source_manga_updates_response_categories'),
				sourceMangaUpdatesResponsePublishers: t.text('source_manga_updates_response_publishers'),
				sourceMangaUpdatesResponseDescription: t.text('source_manga_updates_response_description'),
				sourceMangaUpdatesResponseLastUpdatedAsString: t.text(
					'source_manga_updates_response_last_updated_as_string'
				),
				sourceMangaUpdatesResponseLastUpdatedTimestamp: t.integer(
					'source_manga_updates_response_last_updated_timestamp'
				),
				sourceMangaUpdatesResponseLastUpdatedAsRfc3339: t.text(
					'source_manga_updates_response_last_updated_as_rfc3339'
				),
				sourceMangaUpdatesResponsePublications: t.text(
					'source_manga_updates_response_publications'
				),
				sourceMangaUpdatesResponseRatingVotes: t.integer(
					'source_manga_updates_response_rating_votes'
				),
				sourceMangaUpdatesResponseLatestChapter: t.integer(
					'source_manga_updates_response_latest_chapter'
				),
				sourceMangaUpdatesResponseRelatedSeries: t.text(
					'source_manga_updates_response_related_series'
				),
				sourceMangaUpdatesResponseBayesianRating: t.text(
					'source_manga_updates_response_bayesian_rating'
				),
				sourceMangaUpdatesResponseRecommendations: t.text(
					'source_manga_updates_response_recommendations'
				),
				sourceMangaUpdatesResponseCategoryRecommendations: t.text(
					'source_manga_updates_response_category_recommendations'
				),
				relationshipsAdaptation: t.text('relationships_adaptation'),
				sourceMyAnimeListResponseUrl: t.text('source_my_anime_list_response_url'),
				sourceMyAnimeListResponseRank: t.text('source_my_anime_list_response_rank'),
				sourceMyAnimeListResponseType: t.text('source_my_anime_list_response_type'),
				sourceMyAnimeListResponseScore: t.real('source_my_anime_list_response_score'),
				sourceMyAnimeListResponseTitle: t.text('source_my_anime_list_response_title'),
				sourceMyAnimeListResponseGenres: t.text('source_my_anime_list_response_genres'),
				sourceMyAnimeListResponseImagesJpgImageUrl: t.text(
					'source_my_anime_list_response_images_jpg_image_url'
				),
				sourceMyAnimeListResponseImagesJpgLargeImageUrl: t.text(
					'source_my_anime_list_response_images_jpg_large_image_url'
				),
				sourceMyAnimeListResponseImagesJpgSmallImageUrl: t.text(
					'source_my_anime_list_response_images_jpg_small_image_url'
				),
				sourceMyAnimeListResponseImagesWebpImageUrl: t.text(
					'source_my_anime_list_response_images_webp_image_url'
				),
				sourceMyAnimeListResponseImagesWebpLargeImageUrl: t.text(
					'source_my_anime_list_response_images_webp_large_image_url'
				),
				sourceMyAnimeListResponseImagesWebpSmallImageUrl: t.text(
					'source_my_anime_list_response_images_webp_small_image_url'
				),
				sourceMyAnimeListResponseMalId: t.integer('source_my_anime_list_response_mal_id'),
				sourceMyAnimeListResponseStatus: t.text('source_my_anime_list_response_status'),
				sourceMyAnimeListResponseThemes: t.text('source_my_anime_list_response_themes'),
				sourceMyAnimeListResponseTitles: t.text('source_my_anime_list_response_titles'),
				sourceMyAnimeListResponseAuthors: t.text('source_my_anime_list_response_authors'),
				sourceMyAnimeListResponseMembers: t.integer('source_my_anime_list_response_members'),
				sourceMyAnimeListResponseVolumes: t.text('source_my_anime_list_response_volumes'),
				sourceMyAnimeListResponseApproved: t.integer('source_my_anime_list_response_approved'),
				sourceMyAnimeListResponseChapters: t.integer('source_my_anime_list_response_chapters'),
				sourceMyAnimeListResponseExternal: t.text('source_my_anime_list_response_external'),
				sourceMyAnimeListResponseSynopsis: t.text('source_my_anime_list_response_synopsis'),
				sourceMyAnimeListResponseFavorites: t.integer('source_my_anime_list_response_favorites'),
				sourceMyAnimeListResponsePublishedTo: t.text('source_my_anime_list_response_published_to'),
				sourceMyAnimeListResponsePublishedFrom: t.text(
					'source_my_anime_list_response_published_from'
				),
				sourceMyAnimeListResponsePublishedPropToDay: t.text(
					'source_my_anime_list_response_published_prop_to_day'
				),
				sourceMyAnimeListResponsePublishedPropToYear: t.text(
					'source_my_anime_list_response_published_prop_to_year'
				),
				sourceMyAnimeListResponsePublishedPropToMonth: t.text(
					'source_my_anime_list_response_published_prop_to_month'
				),
				sourceMyAnimeListResponsePublishedPropFromDay: t.integer(
					'source_my_anime_list_response_published_prop_from_day'
				),
				sourceMyAnimeListResponsePublishedPropFromYear: t.integer(
					'source_my_anime_list_response_published_prop_from_year'
				),
				sourceMyAnimeListResponsePublishedPropFromMonth: t.integer(
					'source_my_anime_list_response_published_prop_from_month'
				),
				sourceMyAnimeListResponseRelations: t.text('source_my_anime_list_response_relations'),
				sourceMyAnimeListResponseScoredBy: t.integer('source_my_anime_list_response_scored_by'),
				sourceMyAnimeListResponseBackground: t.text('source_my_anime_list_response_background'),
				sourceMyAnimeListResponsePopularity: t.integer('source_my_anime_list_response_popularity'),
				sourceMyAnimeListResponsePublishing: t.integer('source_my_anime_list_response_publishing'),
				sourceMyAnimeListResponseDemographics: t.text('source_my_anime_list_response_demographics'),
				sourceMyAnimeListResponseTitleEnglish: t.text(
					'source_my_anime_list_response_title_english'
				),
				sourceMyAnimeListResponseSerializations: t.text(
					'source_my_anime_list_response_serializations'
				),
				sourceMyAnimeListResponseTitleJapanese: t.text(
					'source_my_anime_list_response_title_japanese'
				),
				sourceMyAnimeListResponseTitleSynonyms: t.text(
					'source_my_anime_list_response_title_synonyms'
				),
				sourceMyAnimeListResponseExplicitGenres: t.text(
					'source_my_anime_list_response_explicit_genres'
				),
				sourceKitsuResponseBannerImageViews: t.text('source_kitsu_response_bannerImage_views'),
				sourceKitsuResponseBannerImageBlurhash: t.text(
					'source_kitsu_response_bannerImage_blurhash'
				),
				sourceKitsuResponseBannerImageOriginalUrl: t.text(
					'source_kitsu_response_bannerImage_original_url'
				),
				sourceKitsuResponseBannerImageOriginalName: t.text(
					'source_kitsu_response_bannerImage_original_name'
				),
				sourceKitsuResponseBannerImageOriginalWidth: t.integer(
					'source_kitsu_response_bannerImage_original_width'
				),
				sourceKitsuResponseBannerImageOriginalHeight: t.integer(
					'source_kitsu_response_bannerImage_original_height'
				),
				sourceAnilistResponseId: t.integer('source_anilist_response_id'),
				sourceAnilistResponseTags: t.text('source_anilist_response_tags'),
				sourceAnilistResponseType: t.text('source_anilist_response_type'),
				sourceAnilistResponseStaffEdges: t.text('source_anilist_response_staff_edges'),
				sourceAnilistResponseStatsScoreDistribution: t.text(
					'source_anilist_response_stats_scoreDistribution'
				),
				sourceAnilistResponseTitleNative: t.text('source_anilist_response_title_native'),
				sourceAnilistResponseTitleRomaji: t.text('source_anilist_response_title_romaji'),
				sourceAnilistResponseTitleEnglish: t.text('source_anilist_response_title_english'),
				sourceAnilistResponseTitleUserPreferred: t.text(
					'source_anilist_response_title_userPreferred'
				),
				sourceAnilistResponseFormat: t.text('source_anilist_response_format'),
				sourceAnilistResponseGenres: t.text('source_anilist_response_genres'),
				sourceAnilistResponseSeason: t.text('source_anilist_response_season'),
				sourceAnilistResponseSource: t.text('source_anilist_response_source'),
				sourceAnilistResponseStatus: t.text('source_anilist_response_status'),
				sourceAnilistResponseEndDateDay: t.integer('source_anilist_response_endDate_day'),
				sourceAnilistResponseEndDateYear: t.integer('source_anilist_response_endDate_year'),
				sourceAnilistResponseEndDateMonth: t.integer('source_anilist_response_endDate_month'),
				sourceAnilistResponseHashtag: t.text('source_anilist_response_hashtag'),
				sourceAnilistResponseIsAdult: t.integer('source_anilist_response_isAdult'),
				sourceAnilistResponseStudiosEdges: t.text('source_anilist_response_studios_edges'),
				sourceAnilistResponseVolumes: t.integer('source_anilist_response_volumes'),
				sourceAnilistResponseChapters: t.integer('source_anilist_response_chapters'),
				sourceAnilistResponseIsLocked: t.integer('source_anilist_response_isLocked'),
				sourceAnilistResponseRankings: t.text('source_anilist_response_rankings'),
				sourceAnilistResponseSynonyms: t.text('source_anilist_response_synonyms'),
				sourceAnilistResponseMeanScore: t.text('source_anilist_response_meanScore'),
				sourceAnilistResponseRelationsEdges: t.text('source_anilist_response_relations_edges'),
				sourceAnilistResponseStartDateDay: t.integer('source_anilist_response_startDate_day'),
				sourceAnilistResponseStartDateYear: t.integer('source_anilist_response_startDate_year'),
				sourceAnilistResponseStartDateMonth: t.integer('source_anilist_response_startDate_month'),
				sourceAnilistResponseUpdatedAt: t.integer('source_anilist_response_updatedAt'),
				sourceAnilistResponseCoverImageColor: t.text('source_anilist_response_coverImage_color'),
				sourceAnilistResponseCoverImageLarge: t.text('source_anilist_response_coverImage_large'),
				sourceAnilistResponseCoverImageMedium: t.text('source_anilist_response_coverImage_medium'),
				sourceAnilistResponseCoverImageExtraLarge: t.text(
					'source_anilist_response_coverImage_extraLarge'
				),
				sourceAnilistResponseFavourites: t.integer('source_anilist_response_favourites'),
				sourceAnilistResponseIsLicensed: t.integer('source_anilist_response_isLicensed'),
				sourceAnilistResponsePopularity: t.integer('source_anilist_response_popularity'),
				sourceAnilistResponseSeasonYear: t.text('source_anilist_response_seasonYear'),
				sourceAnilistResponseBannerImage: t.text('source_anilist_response_bannerImage'),
				sourceAnilistResponseDescription: t.text('source_anilist_response_description'),
				sourceAnilistResponseIsFavourite: t.integer('source_anilist_response_isFavourite'),
				sourceAnilistResponseAverageScore: t.text('source_anilist_response_averageScore'),
				sourceAnilistResponseExternalLinks: t.text('source_anilist_response_externalLinks'),
				sourceAnilistResponseCountryOfOrigin: t.text('source_anilist_response_countryOfOrigin'),
				sourceAnilistResponseIsReviewBlocked: t.integer('source_anilist_response_isReviewBlocked'),
				sourceAnilistResponseIsFavouriteBlocked: t.integer(
					'source_anilist_response_isFavouriteBlocked'
				),
				sourceAnilistResponseIsRecommendationBlocked: t.integer(
					'source_anilist_response_isRecommendationBlocked'
				),
				relationshipsPrequel: t.text('relationships_prequel'),
				sourceAnimeNewsNetworkResponseId: t.integer('source_anime_news_network_response_id'),
				sourceAnimeNewsNetworkResponseNews: t.text('source_anime_news_network_response_news'),
				sourceAnimeNewsNetworkResponseType: t.text('source_anime_news_network_response_type'),
				sourceAnimeNewsNetworkResponseCover: t.text('source_anime_news_network_response_cover'),
				sourceAnimeNewsNetworkResponseTitle: t.text('source_anime_news_network_response_title'),
				sourceAnimeNewsNetworkResponseGenres: t.text('source_anime_news_network_response_genres'),
				sourceAnimeNewsNetworkResponseReviews: t.text('source_anime_news_network_response_reviews'),
				sourceAnimeNewsNetworkResponseVintage: t.text('source_anime_news_network_response_vintage'),
				sourceAnimeNewsNetworkResponseInterest: t.text(
					'source_anime_news_network_response_interest'
				),
				sourceAnimeNewsNetworkResponseReleases: t.text(
					'source_anime_news_network_response_releases'
				),
				sourceAnimeNewsNetworkResponseInterviews: t.text(
					'source_anime_news_network_response_interviews'
				),
				sourceAnimeNewsNetworkResponseUserRatingsAverage: t.real(
					'source_anime_news_network_response_user_ratings_average'
				),
				sourceAnimeNewsNetworkResponseUserRatingsTotalVotes: t.integer(
					'source_anime_news_network_response_user_ratings_total_votes'
				),
				sourceAnimeNewsNetworkResponseUserRatingsDistribution: t.text(
					'source_anime_news_network_response_user_ratings_distribution'
				),
				sourceAnimeNewsNetworkResponseOtherArticles: t.text(
					'source_anime_news_network_response_other_articles'
				),
				sourceAnimeNewsNetworkResponsePressReleases: t.text(
					'source_anime_news_network_response_press_releases'
				),
				sourceAnimeNewsNetworkResponseAlternativeTitle: t.text(
					'source_anime_news_network_response_alternative_title'
				),
				sourceAnimeNewsNetworkResponseConventionReports: t.text(
					'source_anime_news_network_response_convention_reports'
				),
				sourceAnimeNewsNetworkResponseNumberOfTankoubon: t.text(
					'source_anime_news_network_response_number_of_tankoubon'
				),
				relationshipsOther: t.text('relationships_other'),
				relationshipsMainStory: t.text('relationships_main_story'),
				relationshipsSpinOff: t.text('relationships_spin_off'),
				sourceAnimeNewsNetworkResponsePlotSummary: t.text(
					'source_anime_news_network_response_plot_summary'
				),
				relationshipsAlternative: t.text('relationships_alternative'),
				sourceAnimeNewsNetworkResponseOfficialWebsite: t.text(
					'source_anime_news_network_response_official_website'
				),
				sourceAnimeNewsNetworkResponseThemes: t.text('source_anime_news_network_response_themes'),
				secondaryTitlesJa: t.text('secondary_titles_ja'),
				secondaryTitlesZh: t.text('secondary_titles_zh'),
				relationshipsSideStory: t.text('relationships_side_story'),
				sourceAnimeNewsNetworkResponseNumberOfPages: t.text(
					'source_anime_news_network_response_number_of_pages'
				),
				sourceAnimeNewsNetworkResponseObjectionableContent: t.text(
					'source_anime_news_network_response_objectionable_content'
				),
				sourceKitsuResponsePosterImage: t.text('source_kitsu_response_posterImage'),
				sourceAnimeNewsNetworkResponseVolumes: t.text('source_anime_news_network_response_volumes'),
				secondaryTitlesJaRo: t.text('secondary_titles_ja-ro'),
				secondaryTitlesKo: t.text('secondary_titles_ko'),
				animeEnd: t.text('anime_end'),
				animeStart: t.text('anime_start'),
				sourceAnimeNewsNetworkResponseComment: t.text('source_anime_news_network_response_comment'),
				sourceAnimeNewsNetworkResponseChapterTitles: t.text(
					'source_anime_news_network_response_chapter_titles'
				),
				sourceAnimeNewsNetworkResponseChronology: t.text(
					'source_anime_news_network_response_chronology'
				),
				secondaryTitlesZhRo: t.text('secondary_titles_zh-ro'),
				secondaryTitlesTh: t.text('secondary_titles_th'),
				secondaryTitlesVi: t.text('secondary_titles_vi'),
				secondaryTitlesEs: t.text('secondary_titles_es'),
				secondaryTitlesKoRo: t.text('secondary_titles_ko-ro'),
				secondaryTitlesZhHk: t.text('secondary_titles_zh-hk'),
				secondaryTitlesRu: t.text('secondary_titles_ru'),
				secondaryTitlesEsLa: t.text('secondary_titles_es-la'),
				secondaryTitlesPtBr: t.text('secondary_titles_pt-br'),
				secondaryTitlesDe: t.text('secondary_titles_de'),
				secondaryTitlesFr: t.text('secondary_titles_fr'),
				secondaryTitlesPt: t.text('secondary_titles_pt')
			}),
			(table) => [index('source_anilist_id_idx').on(table.sourceAnilistId)]
		);
	} else {
		throw new Error('DATABASE_FULL_URL must be set when DATABASE_FULL is true');
	}
})();
