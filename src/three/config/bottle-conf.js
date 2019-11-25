let headRadius = 2.11;
export default {
  initPosition: {
    x: -15,
    y: 0,
    z: 0
  },
  headRadius,
  bodyWidth: 1.8141 * headRadius,
  jumpResult: {
    HIT_NEXT_BLOCK_CENTER: 1,
    HIT_CURRENT_BLOCK: 2,
    GAME_OVER_NEXT_BLOCK_BACK: 3,
    GAME_OVER_CURRENT_BLOCK_BACK: 4,
    GAME_OVER_NEXT_BLOCK_FRONT: 5,
    GAME_OVER_BOTH: 6,
    HIT_NEXT_BLOCK_NORMAL: 7
  }
};
