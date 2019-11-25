let customAnimation = {};
customAnimation.to = (duration, oldObj, newObj, easing, delay) => {
  const tween = new TWEEN.Tween(oldObj)
    .to(newObj, duration * 1000)
    .easing(easing || TWEEN.Easing.Linear.None)
    .onUpdate(obj => {
      for (let prop in newObj) {
        oldObj[prop] = obj[prop];
      }
    });
  if (delay) {
    setTimeout(() => {
      tween.start();
    }, delay * 1000);
  } else {
    tween.start();
  }
};

export default customAnimation;
