function component() {
    const element = document.createElement('div');
  
    element.innerHTML = 'Hi Again!!'
  
    return element;
  }
  
  document.body.appendChild(component());