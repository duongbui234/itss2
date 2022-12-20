import Button from '@material-ui/core/Button';
import WrongIcon from '@material-ui/icons/Cancel';
import RightIcon from '@material-ui/icons/CheckCircle';
import CoinIcon from '@material-ui/icons/MonetizationOn';
import accountApi from 'apis/accountApi';
import highscoreApi from 'apis/highscoreApi';
import winAudioSrc from 'assets/audios/win.mp3';
import cupIcon from 'assets/icons/others/cup.png';
import { COINS, MAX, ROUTES } from 'constant';
import { HIGHSCORE_NAME } from 'constant/game';
import { onPlayAudio } from 'helper/speaker.helper';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { setUserCoin } from 'redux/slices/userInfo.slice';
import { cwResultStyle } from './CorrectWord/style';

function convertQuesToCoin(nRight = 0, nWrong = 0, currentCoin = 0) {
  const newCoin =
    nRight * COINS.CORRECT_GAME_PER_QUES -
    nWrong * COINS.CORRECT_GAME_PER_QUES +
    currentCoin;

  if (newCoin < 0) {
    return 0;
  }
  if (newCoin > MAX.USER_COIN) {
    return MAX.USER_COIN;
  }
  return newCoin;
}

function CorrectWordResult({
  gameHistory,
  nRight,
  nWrong,
  nRightConsecutive,
  onReplay,
}) {
  const classes = cwResultStyle();
  const history = useHistory();
  const dispatch = useDispatch();
  const { isAuth, coin } = useSelector((state) => state.userInfo);
  // gameHistory = [
  //   {
  //     word: 'indicate',
  //     mean: 'thể hiện, trình bày',
  //     phonetic: 'ˈɪndɪkeɪt',
  //     wrongList: [
  //       { word: 'show', phonetic: 'ʃəʊ' },
  //       { word: 'indicate', phonetic: 'ˈɪndɪkeɪt' },
  //       { word: 'conduct', phonetic: 'kənˈdʌkt' },
  //     ],
  //     userAnswer: 'indicate',
  //   },
  //   {
  //     word: 'conduct',
  //     mean: 'triển khai, thực hiện',
  //     phonetic: 'kənˈdʌkt',
  //     wrongList: [
  //       { word: 'show', phonetic: 'ʃəʊ' },
  //       { word: 'indicate', phonetic: 'ˈɪndɪkeɪt' },
  //       { word: 'conduct', phonetic: 'kənˈdʌkt' },
  //     ],
  //     userAnswer: 'assure',
  //   },
  //   {
  //     word: 'assure',
  //     mean: 'đảm bảo, cam đoan',
  //     phonetic: 'əˈʃʊə(r)',
  //     wrongList: [
  //       { word: 'show', phonetic: 'ʃəʊ' },
  //       { word: 'indicate', phonetic: 'ˈɪndɪkeɪt' },
  //       { word: 'conduct', phonetic: 'kənˈdʌkt' },
  //     ],
  //     userAnswer: 'show',
  //   },
  //   {
  //     word: 'show',
  //     mean: 'thể hiện, chỉ ra',
  //     phonetic: 'ʃəʊ',
  //     wrongList: [
  //       { word: 'show', phonetic: 'ʃəʊ' },
  //       { word: 'indicate', phonetic: 'ˈɪndɪkeɪt' },
  //       { word: 'conduct', phonetic: 'kənˈdʌkt' },
  //     ],
  //     userAnswer: 'assure',
  //   },
  //   {
  //     word: 'assign',
  //     mean: 'chỉ định',
  //     phonetic: 'əˈsaɪn',
  //     wrongList: [
  //       { word: 'show', phonetic: 'ʃəʊ' },
  //       { word: 'indicate', phonetic: 'ˈɪndɪkeɪt' },
  //       { word: 'conduct', phonetic: 'kənˈdʌkt' },
  //     ],
  //     userAnswer: 'assure',
  //   },
  // ];
  // console.log(gameHistory);
  // play win audio
  useEffect(() => {
    onPlayAudio(winAudioSrc);
  }, []);

  // save coin and update highscore
  useEffect(() => {
    if (!isAuth) return;

    (async function () {
      try {
        const newCoin = convertQuesToCoin(nRight, nWrong, coin);
        highscoreApi.putUpdateHighscore(HIGHSCORE_NAME.TOP_COIN, newCoin);

        highscoreApi.putUpdateHighscore(
          HIGHSCORE_NAME.CORRECT_GAME_RIGHT,
          nRight,
        );

        highscoreApi.putUpdateHighscore(
          HIGHSCORE_NAME.CORRECT_GAME_RIGHT_CONSECUTIVE,
          nRightConsecutive,
        );

        const apiRes = await accountApi.putUpdateUserCoin(newCoin);
        if (apiRes.status === 200) {
          dispatch(setUserCoin(newCoin));
        }
      } catch (error) {}
    })();
  }, []);

  const onGoBack = () => {
    history.push(ROUTES.GAMES.HOME);
  };

  return (
    <div>
      <div className={`${classes.root} flex-center-col`}>
        <img className={classes.img} src={cupIcon} alt="Cup Photo" />
        <div className={`${classes.result} flex-center--ver`}>
          <b>{nRight}</b>&nbsp;Đúng
          <RightIcon className={`${classes.icon} right`} />
          &nbsp;-&nbsp;
          <b>{nRightConsecutive}</b>&nbsp;Đúng liên tiếp
          <RightIcon className={`${classes.icon} right`} />
          &nbsp;-&nbsp;
          <b>{nWrong}</b>&nbsp;Sai
          <WrongIcon className={`${classes.icon} wrong`} />
        </div>

        {isAuth && (
          <div className={`${classes.result} flex-center--ver mt-4`}>
            <CoinIcon
              className={classes.icon}
              style={{ color: '#C3AD1A', marginLeft: 0 }}
            />
            Số coin hiện tại:&nbsp;<b>{coin}</b>
          </div>
        )}

        <div className="mt-10">
          <Button
            className="_btn _btn-outlined-stand mr-5"
            variant="outlined"
            onClick={onGoBack}>
            Quay về
          </Button>
          <Button className="_btn _btn-primary" onClick={onReplay}>
            Chơi lại
          </Button>
        </div>
      </div>
      &nbsp;&nbsp;
      <div>Lịch sử bài thi</div>
      {gameHistory.map((answer, index) => (
        <div>
          <div>
            Câu hỏi: <span>{answer.mean}</span>
          </div>
          <div>
            Đáp án:
            <span>{answer.word}</span>
            {answer.wrongList.map((wrongAnswer, index) => (
              <div>
                <span>{wrongAnswer.word}</span>
              </div>
            ))}
            <span>Bạn đã chọn: {answer.userAnswer}</span>
          </div>
          &nbsp;&nbsp;
        </div>
      ))}
    </div>
  );
}

CorrectWordResult.propTypes = {
  nRight: PropTypes.number,
  nWrong: PropTypes.number,
  nRightConsecutive: PropTypes.number,
  onReplay: PropTypes.func,
};

CorrectWordResult.defaultProps = {
  nRight: 0,
  nWrong: 0,
  nRightConsecutive: 0,
  onReplay: function () {},
};

export default CorrectWordResult;
