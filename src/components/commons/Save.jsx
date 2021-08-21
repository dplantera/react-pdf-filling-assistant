import React, {useEffect} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import {green} from '@material-ui/core/colors';
import CheckIcon from '@material-ui/icons/Check';
import SaveIcon from '@material-ui/icons/Save';
import {Fade} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    root: {
        position: "absolute",
        display: 'flex',
        alignItems: 'center',
    },
    wrapper: {
        position: 'relative',
    },
    buttonSuccess: {
        borderRadius: "50%",
        backgroundColor: green[300]
    },
    fabProgress: {
        color: green[300],
        position: 'absolute',
        left: -3,
        top: -3
    }
}));

export default function Save({show, onDone, ...rest}) {
    const classes = useStyles();
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const timer = React.useRef();

    React.useEffect(() => {
        return () => {
            clearTimeout(timer.current);
        };
    }, []);

    const handleButtonClick = () => {
        return new Promise(resolve => {
            if (!loading) {
                setSuccess(false);
                setLoading(true);
                timer.current = setTimeout(() => {
                    setSuccess(true);
                    setLoading(false);
                    resolve()
                }, 2000);
            }
        })
    };
    const reset = () => {
        setTimeout(() => {
            setLoading(false)
            setSuccess(false);
            onDone(true)
        }, 2000)
    }
    useEffect(() => {
        handleButtonClick().then(() => {
            reset();
        })
        // eslint-disable-next-line
    }, []);

    return (
        <Fade in={show} className={classes.root} {...rest}>
            <div className={classes.wrapper}>
                <div className={success ? classes.buttonSuccess : classes.wrapper} onClick={handleButtonClick}>
                    {success ? <CheckIcon /> : <SaveIcon />}
                </div>
                {loading && <CircularProgress size={30} className={classes.fabProgress}/>}
            </div>
        </Fade>);
}