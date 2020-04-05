class CalendarDataInstaller {
  async insertData() {
    await this.getData();
    this.scanActions();
  }

  async getData() {
    const response = await fetch('/getdata');

    if (response.ok) {
      this.data = await response.json();
    } else {
      throw new Error(`Возникла проблема с fetch запросом. ${response.status}`);
    }
  }

  scanActions() {
    for (const action of this.data) {
      this.constructor.scanActionActivity(action);
    }
  }

  // Данная функция будет вызываться отдельно для каждого действия со статусом true
  static async scanActionActivity(action) {
    const currentDate = new Date(); // Получить текущую дату
    const createdDate = new Date(action.created); // Получить дату создания действия
    const actionActivity = action.dates; // Получить существующие в бд даты активности
    let newActivity = []; // контейнер для новых активностей

    console.log(actionActivity);

    let i = 0;
    const sumDays = []; // общее кол-во дней, включая текущий, с момента создания действия

    while (createdDate.getDate() !== currentDate.getDate()) {
      currentDate.setDate(currentDate.getDate() - i);
      i = 1;
      sumDays.push([currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()]);
    }

    // сравнение количества существующих дат и фактической их суммы
    // если есть разница, то добавить новые активности в контейнер
    if (actionActivity.length !== sumDays.length) {
      for (let i = 0; i < sumDays.length; i++) {
        if (!actionActivity[i]) {
          newActivity.push({
            year: sumDays[i][0],
            month: sumDays[i][1],
            day: sumDays[i][2],
          });
        }
      }
    }

    console.log(newActivity);

    // если контейнер не пустой, то отправить данные на сервер
    if (newActivity.length) {
      const obj = {
        id: action._id,
        activities: newActivity,
      };

      const response = await fetch('/set-new-activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(obj),
      });

      if (response.ok) {
        console.log('Активность обновлена');
      } else {
        throw new Error(`Возникла проблема с fetch запросом. ${response.status}`);
      }
    }
  }

}

const calendarData = new CalendarDataInstaller();

calendarData.insertData();
