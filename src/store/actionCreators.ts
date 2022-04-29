export const toggleLoginAction = (flag: boolean, info: any) => {
    return {
      type: 'toggleLogin',
      flag,
      info,
    };
  };
  