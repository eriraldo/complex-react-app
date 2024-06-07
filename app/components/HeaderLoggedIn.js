import React, { useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import Axios from "axios"
import DispatchContext from "../DispatchContext"
import StateContext from "../StateContext"
import { Tooltip as ReactToolTip } from "react-tooltip"
function HeaderLoggedIn(props) {
    const globalDispatch = useContext(DispatchContext)
    const globalState = useContext(StateContext)

    function handleLogout() {
        globalDispatch({ type: "logout" })
    }

    function handleSearchIcon(e) {
        e.preventDefault()
        globalDispatch({ type: "openSearch" })
    }
    return (
        <div className="flex-row my-3 my-md-0">
            <a
                data-tooltip-id="search"
                data-tooltip-content="Search"
                onClick={handleSearchIcon}
                href="#"
                className="text-white mr-2 header-search-icon"
            >
                <i className="fas fa-search"></i>
            </a>
            <ReactToolTip
                place="bottom"
                id="search"
                className="custom-tooltip"
            />{" "}
            <span
                data-tooltip-id="chat"
                data-tooltip-content="Chat"
                className="mr-2 header-chat-icon text-white"
            >
                <i className="fas fa-comment"></i>
                <span className="chat-count-badge text-white"> </span>
            </span>
            <ReactToolTip place="bottom" id="chat" className="custom-tooltip" />{" "}
            <Link
                data-tooltip-id="profile"
                data-tooltip-content="My Profile"
                to={`/profile/${globalState.user.username}`}
                className="mr-2"
            >
                <img
                    className="small-header-avatar"
                    src={globalState.user.avatar}
                />
            </Link>
            <ReactToolTip
                place="bottom"
                id="profile"
                className="custom-tooltip"
            />{" "}
            <Link className="btn btn-sm btn-success mr-2" to="/create-post">
                Create Post
            </Link>{" "}
            <button onClick={handleLogout} className="btn btn-sm btn-secondary">
                Sign Out
            </button>
        </div>
    )
}

export default HeaderLoggedIn
