import React, {memo, useEffect, useRef, useState} from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/themes/prism.css";
import PropTypes from "prop-types";
import {makeStyles, Modal, Paper} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {useSave} from "../../hooks/useSave";


const switchLanguage = async (codeLanguage) => {
    console.debug("switchLanguage: ", {codeLanguage})

    switch (codeLanguage) {
        case "velocity":
            console.debug("switchLanguage: ", "velocity")
            await import("prismjs/components/prism-velocity");
            return {
                grammar: Prism.languages.velocity,
                language: "velocity"
            }
        case "velocityJs"://customized definition
            console.debug("switchLanguage: ", "velocityJs")
            await import("./custom-definitions/prism-velocityJs");
            return {
                grammar: Prism.languages.velocityJs,
                language: "velocityJs"
            }
        case "javascript":
            console.debug("switchLanguage: default -", "javascript")
            await import("prismjs/components/prism-javascript")
            return {
                grammar: Prism.languages.js,
                language: "javascript"
            }
        default:
            console.debug("switchLanguage: default -", "javascript")
            await import("prismjs/components/prism-javascript")
            return {
                grammar: Prism.languages.js,
                language: "javascript"
            }
    }
}

const useStyles = makeStyles((theme) => ({
    modal: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', height: "100%",
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        width: "80%",
        maxHeight: "80%",
        maxWidth: "1300px",
        display: "flex",
        flexDirection: "column",
    },
    codeEditor: {
        position: "relative",
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 12,
        height: "100%",
        minHeight: 200,
    },
    codePreTag: {
        height: "100%",
    },
    codeEditorHeader: {
        position: "relative"
    },
    codeEditorSave: {
        position: "absolute", right: 0, top: 0
    },
    codeEditorContent: {
        position: "relative", overflow: "auto", minHeight: "200px"
    },
    codeEditorFooter: {
        position: "relative", display: "flex", justifyContent: "flex-end"
    },
    codeEditorControls: {
        position: "relative", alignSelf: "end",
    }
}));

const createHighlightForLang = async (lang) => {
    const {grammar, language} = await switchLanguage(lang)
    return (_code) => Prism.highlight(_code, grammar, language)
}

export const CodeEditor = memo(({
                                    codeString,
                                    open,
                                    codeLanguage,
                                    header,
                                    footer,
                                    onBlur,
                                    onSubmit,
                                    onSave,
                                    onClose,
                                    ...rest
                                }) => {
    const {show: showSaveIcon, RenderSave} = useSave();

    const [code, setCode] = useState(codeString ?? "");
    const [isInitialized, setIsInitialized] = useState(false);
    const classes = useStyles();

    const refHighlight = useRef(null)

    const handleSaveKeyPress = (event) => {
        const {ctrlKey, key} = event;
        if (ctrlKey && key === "s") {
            event.preventDefault();
            handleSave()
        }
    }

    const handleSave = () => {
        showSaveIcon();
        onSave?.(code, codeString)
    };
    const handleSubmit = () => onSubmit?.(code);
    const handleClose = () => onClose?.(code, codeString);

    useEffect(() => {
        createHighlightForLang(codeLanguage)
            .then(highlight => {
                refHighlight.current = highlight;
                setIsInitialized(true)
            })
            .catch(err => console.log(err));
    }, [codeLanguage, setIsInitialized])

    return isInitialized && <Modal open={open} className={classes.modal}>
        <Paper className={classes.paper} onKeyDown={handleSaveKeyPress}>
            <div className={classes.codeEditorHeader}>
                {header}
                <RenderSave className={classes.codeEditorSave}/>
            </div>
            <div className={classes.codeEditorContent}>
                <Editor value={code} t
                        onValueChange={(code) => {
                            setCode(code)
                        }}
                        highlight={refHighlight.current}
                        padding={10}
                        onBlur={() => onBlur?.(code, codeString)}
                        className={classes.codeEditor}
                        preClassName={classes.codePreTag}
                        {...rest}
                />
            </div>
            <div className={classes.codeEditorFooter}>
                <div className={classes.codeEditorControls}>
                    <Button onClick={handleClose}>Close</Button>
                    <Button onClick={handleSave}>Save</Button>
                    <Button onClick={handleSubmit}>Submit</Button>
                </div>
                {footer}
            </div>
        </Paper>
    </Modal>
})

CodeEditor.propTypes =
    {
        codeString: PropTypes.string,
        codeLanguage: PropTypes.string,
        open: PropTypes.bool,
        header: PropTypes.element,
        footer: PropTypes.element,
        onBlur: PropTypes.func,
        onSave: PropTypes.func,
        onClose: PropTypes.func
    };