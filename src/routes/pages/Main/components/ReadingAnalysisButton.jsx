import React from "react";

import { BaseButton } from "../../../../components/Button";

const ReadingAnalysisButton = ({

    onClick

}) => {
    return (
        <BaseButton className="reading-analysis-btn" onClick={onClick}>
            📊 독서 분석
        </BaseButton>
    );
};

export default ReadingAnalysisButton;