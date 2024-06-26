import React, { useContext, useEffect, useState } from "react"
import Page from "./Page"
import { useParams, Link, useNavigate } from "react-router-dom"
import Axios from "axios"
import LoadingDotsIcon from "./LoadingDotsIcon"
import { useImmer, useImmerReducer } from "use-immer"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import NotFound from "./NotFound"

function EditPost() {
    const navigate = useNavigate()
    const globalState = useContext(StateContext)
    const globalDispatch = useContext(DispatchContext)
    const originalState = {
        title: {
            value: "",
            hasErrors: false,
            message: "",
        },
        body: {
            value: "",
            hasErrors: false,
            message: "",
        },
        isFetching: true,
        isSaving: false,
        id: useParams().id,
        sendCount: 0,
        notFound: false,
    }

    function ourReducer(draft, action) {
        switch (action.type) {
            case "fetchComplete":
                draft.title.value = action.value.title
                draft.body.value = action.value.body
                draft.isFetching = false
                return
            case "titleChange":
                draft.title.value = action.value
                draft.title.hasErrors = false
                return
            case "bodyChange":
                draft.body.value = action.value
                draft.body.hasErrors = false
                return
            case "submitRequest":
                if (!draft.title.hasErrors && !draft.body.hasErrors) {
                    draft.sendCount++
                }
                return
            case "saveRequestStarted":
                draft.isSaving = true
                return
            case "saveRequestFinished":
                draft.isSaving = false
                return
            case "titleRules":
                if (!action.value.trim()) {
                    draft.title.hasErrors = true
                    draft.title.message = "You must provide a title."
                }
                return
            case "bodyRules":
                if (!action.value.trim()) {
                    draft.body.hasErrors = true
                    draft.body.message = "You must provide body content."
                }
                return
            case "notFound":
                draft.notFound = true
                return
        }
    }
    const [state, dispatch] = useImmerReducer(ourReducer, originalState)

    function submitHandler(e) {
        e.preventDefault()
        dispatch({ type: "titleRules", value: state.title.value })
        dispatch({ type: "bodyRules", value: state.body.value })
        dispatch({ type: "submitRequest" })
    }

    useEffect(() => {
        const ourRequest = Axios.CancelToken.source()
        async function fetchPost() {
            try {
                const response = await Axios.get(`/post/${state.id}`, {
                    cancelToken: ourRequest.token,
                })
                if (response.data) {
                    dispatch({ type: "fetchComplete", value: response.data })
                    if (
                        globalState.user.username !=
                        response.data.author.username
                    ) {
                        globalDispatch({
                            type: "flashMessage",
                            value: "You do not have permission to edit that post",
                        })
                        //redirect to homepage
                        navigate("/")
                    }
                } else {
                    dispatch({ type: "notFound" })
                }
            } catch (e) {
                console.log("There was a problem or the request was cancelled")
            }
        }
        fetchPost()
        return () => {
            ourRequest.cancel()
        }
    }, [])

    useEffect(() => {
        if (state.sendCount) {
            dispatch({ type: "saveRequestStarted" })
            const ourRequest = Axios.CancelToken.source()
            async function fetchPost() {
                try {
                    const response = await Axios.post(
                        `/post/${state.id}/edit`,
                        {
                            title: state.title.value,
                            body: state.body.value,
                            token: globalState.user.token,
                        },
                        {
                            cancelToken: ourRequest.token,
                        }
                    )
                    dispatch({ type: "saveRequestFinished" })
                    globalDispatch({
                        type: "flashMessage",
                        value: "Post was updated",
                    })
                } catch (e) {
                    console.log(
                        "There was a problem or the request was cancelled"
                    )
                }
            }
            fetchPost()
            return () => {
                ourRequest.cancel()
            }
        }
    }, [state.sendCount])

    if (state.notFound) {
        return <NotFound />
    }
    if (state.isFetching)
        return (
            <Page title="...">
                <LoadingDotsIcon></LoadingDotsIcon>
            </Page>
        )

    return (
        <Page title="Edit Post">
            <Link className="small font-weight-bold" to={`/post/${state.id}`}>
                {" "}
                &laquo; Back to post permalink
            </Link>
            <form className="mt-3" onSubmit={submitHandler}>
                <div className="form-group">
                    <label htmlFor="post-title" className="text-muted mb-1">
                        <small>Title</small>
                    </label>
                    <input
                        autoFocus
                        name="title"
                        id="post-title"
                        className="form-control form-control-lg form-control-title"
                        type="text"
                        placeholder=""
                        autoComplete="off"
                        onChange={(e) =>
                            dispatch({
                                type: "titleChange",
                                value: e.target.value,
                            })
                        }
                        onBlur={(e) =>
                            dispatch({
                                type: "titleRules",
                                value: e.target.value,
                            })
                        }
                        value={state.title.value}
                    />
                    {state.title.hasErrors && (
                        <div className="alert alert-danger small liveValidateMessage">
                            {state.title.message}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label
                        htmlFor="post-body"
                        className="text-muted mb-1 d-block"
                    >
                        <small>Body Content</small>
                    </label>
                    <textarea
                        name="body"
                        id="post-body"
                        className="body-content tall-textarea form-control"
                        type="text"
                        onChange={(e) =>
                            dispatch({
                                type: "bodyChange",
                                value: e.target.value,
                            })
                        }
                        onBlur={(e) =>
                            dispatch({
                                type: "bodyRules",
                                value: e.target.value,
                            })
                        }
                        value={state.body.value}
                    />
                    {state.body.hasErrors && (
                        <div className="alert alert-danger small liveValidateMessage">
                            {state.body.message}
                        </div>
                    )}
                </div>

                <button className="btn btn-primary" disabled={state.isSaving}>
                    Save Updates
                </button>
            </form>
        </Page>
    )
}

export default EditPost
