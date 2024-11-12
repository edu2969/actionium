'use client'
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import 'dayjs/locale/es'
import './page.css'
import { MdPriceChange } from "react-icons/md";
import { GoPasskeyFill } from "react-icons/go"
import useMeasure from "react-use-measure"
import { LineChart } from "@/components/charts/LineChart"
import { MultiLineChart } from "@/components/charts/MultiLineChart"
import { GiTeamUpgrade } from "react-icons/gi";

dayjs.locale("es");

type PointType = {
  date: Date,
  value: number,
}

type KeyType = {
  category: string,
  points: PointType[],
}

const HomeGerencia = () => {
  const [BIData, setBIData] = useState<PointType[]>([]);
  const [vendorData, setVendorData] = useState<KeyType[]>([{
    category: "DIMERC S.A.",
    points: [{
      date: dayjs('2023-08-01 00:00').toDate(),
      value: 3750677,
    }, {
      date: dayjs('2023-09-01 00:00').toDate(),
      value: 2900098,
    },{
      date: dayjs('2023-10-01 00:00').toDate(),
      value: 1780088,
    },{
      date: dayjs('2023-11-01 00:00').toDate(),
      value: 499877,
    },{
      date: dayjs('2023-12-01 00:00').toDate(),
      value: 570987,
    },{
      date: dayjs('2024-01-01 00:00').toDate(),
      value: 1233440,
    }]
  }, {
    category: "CL07",
    points: [{
      date: dayjs('2023-08-01 00:00').toDate(),
      value: 1455000,
    }, {
      date: dayjs('2023-09-01 00:00').toDate(),
      value: 1500000,
    },{
      date: dayjs('2023-10-01 00:00').toDate(),
      value: 1561090,
    },{
      date: dayjs('2023-11-01 00:00').toDate(),
      value: 1149000,
    },{
      date: dayjs('2023-12-01 00:00').toDate(),
      value: 1969898,
    },{
      date: dayjs('2024-01-01 00:00').toDate(),
      value: 2208000,
    }]
  }, {
    category: "TRECK S.A.",
    points: [{
      date: dayjs('2023-08-01 00:00').toDate(),
      value: 455000,
    }, {
      date: dayjs('2023-09-01 00:00').toDate(),
      value: 1200000,
    },{
      date: dayjs('2023-10-01 00:00').toDate(),
      value: 2265090,
    },{
      date: dayjs('2023-11-01 00:00').toDate(),
      value: 1349000,
    },{
      date: dayjs('2023-12-01 00:00').toDate(),
      value: 1569898,
    },{
      date: dayjs('2024-01-01 00:00').toDate(),
      value: 708000,
    }]
  }])

  const [teamData, setTeamData] = useState<KeyType[]>([{
    category: "LBR",
    points: [{
      date: dayjs('2023-08-01 00:00').toDate(),
      value: 1750677,
    }, {
      date: dayjs('2023-09-01 00:00').toDate(),
      value: 1000098,
    },{
      date: dayjs('2023-10-01 00:00').toDate(),
      value: 80088,
    },{
      date: dayjs('2023-11-01 00:00').toDate(),
      value: 399877,
    },{
      date: dayjs('2023-12-01 00:00').toDate(),
      value: 470987,
    },{
      date: dayjs('2024-01-01 00:00').toDate(),
      value: 233440,
    }]
  }, {
    category: "Acerería",
    points: [{
      date: dayjs('2023-08-01 00:00').toDate(),
      value: 1455000,
    }, {
      date: dayjs('2023-09-01 00:00').toDate(),
      value: 1900000,
    },{
      date: dayjs('2023-10-01 00:00').toDate(),
      value: 1561090,
    },{
      date: dayjs('2023-11-01 00:00').toDate(),
      value: 1349000,
    },{
      date: dayjs('2023-12-01 00:00').toDate(),
      value: 1569898,
    },{
      date: dayjs('2024-01-01 00:00').toDate(),
      value: 1108000,
    }]
  }, {
    category: "Colada",
    points: [{
      date: dayjs('2023-08-01 00:00').toDate(),
      value: 1235000,
    }, {
      date: dayjs('2023-09-01 00:00').toDate(),
      value: 800000,
    },{
      date: dayjs('2023-10-01 00:00').toDate(),
      value: 2261090,
    },{
      date: dayjs('2023-11-01 00:00').toDate(),
      value: 1049000,
    },{
      date: dayjs('2023-12-01 00:00').toDate(),
      value: 2169898,
    },{
      date: dayjs('2024-01-01 00:00').toDate(),
      value: 408000,
    }]
  }])

  const [ref, bounds] = useMeasure();
  const initData = useRef(false);

  async function getData() {
    console.log("ACTUAL", BIData);
    const res = await fetch(`/api/bi/toolStorage`)
    res.json().then((data: IBIToolStorage[] | any) => {
      var arreglo = new Array(12).fill([]).map((elem, index) => {
        var fecha = dayjs().month(index).startOf("month").toDate();
        return {
          date: fecha,
          value: 0
        };
      });
      var newData = data.data;
      console.log("NEW_DATA", newData);
      if (newData == null) return;
      newData.forEach(reg => {
        var month = dayjs(reg.date).month();
        arreglo[month].value = reg.totalAmount;
      })
      setBIData(arreglo)
      console.log("FINAL!", arreglo);
    });
  }

  useEffect(() => {
    if (!initData.current) {
      initData.current = true
      getData();
    }
  }, [])

  return (
    <div className="flex h-screen w-full">
      <div className="w-1/3 h-1/2 mt-20 pl-10 text-blue-500" ref={ref}>
        <div className="flex mb-10 text-blue-900">
          <MdPriceChange size="4em" />
          <p className="text-4xl mt-3 ml-3">Valor BODEGA</p>
        </div>
        {BIData.length > 0 && <LineChart data={BIData} width={bounds.width} height={bounds.height}></LineChart>}
      </div>
      <div className="w-1/3 h-1/2 mt-20 pl-10 text-blue-500" ref={ref}>
        <div className="flex mb-10 text-blue-900">        
          <GoPasskeyFill size="4em" />
          <p className="text-4xl mt-3 ml-3">Proveedores claves</p>
        </div>
        {vendorData.length > 0 && <MultiLineChart data={vendorData} width={bounds.width} height={bounds.height}></MultiLineChart>}
      </div>
      <div className="w-1/3 h-1/2 mt-20 pl-10 text-blue-500" ref={ref}>
        <div className="flex mb-10 text-blue-900">        
          <GiTeamUpgrade size="4em" />
          <p className="text-4xl mt-3 ml-3">Gasto menual/equipo</p>
        </div>
        {teamData.length > 0 && <MultiLineChart data={teamData} width={bounds.width} height={bounds.height}></MultiLineChart>}
      </div>
    </div>
  );
}

export default HomeGerencia;