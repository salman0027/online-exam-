import React from 'react';
import {Component} from 'react';
import { Link, Redirect, withRouter,Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import Playground from './Playground'
import {examFetchBigin, examFetchSucceed, examFetchFail, exitExam } from '../actions/actions'
import Auth from '../utils/Auth'

class Base extends Component{

    constructor(props){
        super(props);
        this.state ={
            timer: 3000000,
            timeOver: false
        }
    }

    componentDidMount(){
        this.interval = setInterval(() => {
            if (this.state.timer === 0 ) {
                dispatch(exitExam());
                this.setState({ timeOver: true });
                clearInterval(this.interval);
            }else{
                this.setState({
                    timer: this.state.timer-1000
                });
            }
        }, 1000);


        const { dispatch } = this.props;
        dispatch(examFetchBigin());
        fetch("http://localhost:3002/api/exam",{
            headers: {
              'Authorization': 'bearer ' + Auth.getToken(),
            }
        })
        .then(function(response) {
            return response.json() }
        ).then(
            res => {
                console.log(res.payload);
                dispatch(examFetchSucceed(res.payload));}
        ).catch(
            error=> { dispatch(examFetchFail(error)); }
        )
    }

    componentWillUnmount(){
        clearInterval(this.interval);
        this.setState({
            examData: null
        })
    }


    userExitExam=()=>{
        let { dispatch, history } = this.props;
        dispatch(exitExam());
        history.replace('/score');
    }


    render(){
        const { isFetching, didInvalidate, data, isValidUser, history } = this.props
        let PlaygroundPlaceholder;
        if(this.state.timeOver || this.props.isSubmitted) {
            PlaygroundPlaceholder = <Redirect replace={true} to='/score' />;
        }else{
            if ( isFetching ) {
                PlaygroundPlaceholder = <div> <div> </div>Loading questions... </div>
            } else {
                if( didInvalidate ){
                    PlaygroundPlaceholder =  <div> There is an error when fetching exam infomation!! </div>
                }else{
                    PlaygroundPlaceholder =  < Playground payload = {data} />
                }
            }
        }

        const view = isValidUser ?
        (
            <div className="base" >
                <div className="caption">
                    <span> NAF </span>
                    <span>Time Remaining:</span><span>{this.state.timer/1000} </span>
                    <button >?</button>
                    <button onClick={this.userExitExam} >Exit Test</button>
                </div>
                <div className="container" >
                    {PlaygroundPlaceholder}
                </div>
            </div>
        ):
        (
            <div>
                <div> Invalid request: needs login credentials </div>
                <Link to='/' > Login </Link>
            </div>
        )

        return view

    }
}



const mapStateToProps = (state)=>({
    isFetching: state.examData.isFetching,
    didInvalidate: state.examData.didInvalidate,
    data: state.examData.data,
    isValidUser: state.isValidUser,
    isSubmitted: state.scoreData.isSubmitted
})

// https://redux.js.org/faq/react-redux#why-dont-i-have-this-props-dispatch-available-in-my-connected-component
// ??????????????????????????? mapDispatchToProps ???????????????
// ?????? dispatch ??????container component??????presentational component???
// ?????????????????? props

// ????????? mapDispatchToProps ?????????????????????presentational component
// ?????????????????? dispatch props???
// ????????????????????????dispatch prop??????????????????mapDispatchToProps???????????????????????????????????????
const BaseContainer = withRouter(connect(mapStateToProps)(Base))
export default BaseContainer
