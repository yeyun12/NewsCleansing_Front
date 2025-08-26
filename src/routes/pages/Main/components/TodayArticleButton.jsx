import React from "react";

import { BaseButton } from "../../../../components/Button";

const TodayArticleButton = ({

    onClick

}) => {
    return (
        <BaseButton className="today-article-btn" onClick={onClick}>
            📰 오늘의 추천 뉴스
        </BaseButton>
    );
};

export default TodayArticleButton;