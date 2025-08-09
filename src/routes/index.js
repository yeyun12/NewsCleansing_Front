import React, { useState, useEffect } from "react";

// URL 설정을 위한 라이브러리임.
import { Route, Routes } from "react-router-dom";

// 사용자가 만든 페이지(여기서는 Main 밖에 없음
import { Main } from "./pages";

// 아래 코드 내에서 링크와 페이지를 연결함. 페이지를 만들 때마다 추가해야함.
const Router = () => {

    /* 변수(state) 및 useEffect설정 부분 */
    const test = useState(0); // 예제를 위한 state

    /* 예제를 위한 useEffect */
    useEffect(() => {
    }, []); // []로 설정이 되어 있으므로 페이지가 로드될 때 한번만 실행된다

    /* 출력할 페이지 설정 부분 */
    return (
        /* 리액트의 경우 return에 존재하는 최상위 태그는 하나. */

        <div className="app">

            <Routes>
                {/* 
                    path: URL
                    - path="/user"인 경우 http://localhost:3000/user로 접근 가능
                    element: 출력할 페이지
                    - 위에서 import한 페이지만 사용 가능. 여기서는 'Main' 페이지만 import 했음.
                */}
                <Route
                    path="/"
                    element={<Main/>}
                />

            </Routes>

        </div>
    )
}

export default Router;