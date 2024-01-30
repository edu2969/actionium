'use client'
import Loader from "@/app/components/loader/loader";
import { useState } from "react";
import * as XLSX from "xlsx"

export default function ImportarOrdenes() {
  const [messages, setMessages] = useState<string[]>([]);
  const [procesado, setProcesado] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const make_cols = (refstr: string): (any[] | undefined) => {
    let o = [],
      C = XLSX.utils.decode_range(refstr).e.c + 1;
    for (var i = 0; i < C; ++i) o[i] = { name: XLSX.utils.encode_col(i), key: i };
    return o;
  };

  function handleChange(e: any) {
    const files = e.target.files;
    if (files && files[0]) handleFile(files[0]);
  }

  function reiniciar() {
    setProcesado(false);
  }


  async function postPOCs(pos: IPurchaseOrderDTO[]) {
    const resp = await fetch(`/api/purchaseOrders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pos)
    });
    console.log("RESP", resp);
    if (resp.ok) {
      setMessages(pos.map(p => `${p.identifier} ok`));
    } else {
      console.log("update failed.", resp);
      setMessages(["Error al procesar las OCs: " + resp.statusText])
    }
    setProcesado(true);
    setProcesando(false);
  }

  function handleFile(file: Blob) {
    setProcesando(true);
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    reader.onload = (e: any) => {
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, { type: rABS ? "binary" : "array" });
      const wsnames = wb.SheetNames;
      const wsPOCs = wb.Sheets[wsnames[0]];
      const dataPOCs: string[] = XLSX.utils.sheet_to_json(wsPOCs, { header: 1 });
      const POCs: IPurchaseOrderDTO[] = [];
      if (dataPOCs && dataPOCs.length > 1) {
        dataPOCs.forEach((d, index) => {
          if (index > 0) {
            const po: IPurchaseOrderDTO = {
              identifier: d[0],
              site: d[1],
              invoiceAccount: d[2],
              vendorName: d[3],
              approvalStatus: d[4] === "Confirmed" ? 1 : 0,
              status: d[5] === "Received" ? 1 : 0,
              currency: d[6],
              requestReceiptDate: new Date(d[7]),
              projectId: d[8],
              requesterName: d[9],
              termsOfPayment: d[10],
              creatorName: d[11],
              createdAt: new Date(d[12]),
              items: [],
            }
            POCs.push(po);
          }
        })
      }

      for (var i = 1; i < wsnames.length; i++) {
        const wsPOCItems = wb.Sheets[wsnames[i]];
        const dataPOCItems: string[] = XLSX.utils.sheet_to_json(wsPOCItems, { header: 1 });
        if (dataPOCItems && dataPOCItems.length > 1) {
          dataPOCItems.forEach((d, index) => {
            if (index > 0) {
              const item: IPurchaseOrderItemDTO = {
                lineNumber: index,
                identifier: d[3],
                productName: d[5],
                description: d[6],
                quantity: Number(d[8]),
                unit: d[9],
                unitPrice: Number(d[10]),
                netAmount: Number(d[13]),
              }
              POCs[i - 1].items.push(item);
            }
          })
        }
      }
      postPOCs(POCs);
    }
    if (rABS) reader.readAsBinaryString(file);
    else reader.readAsArrayBuffer(file);
  }

  return (
    <main className="w-full mt-14">
      {!procesado && !procesando ?
        <div className="w-screen text-center p-6">
          <div className="w-full">
            <div className="w-full py-6">
              <h1 className="text-cyan-800 text-2xl">Subir nueva OC</h1>
              <span>Usa éste recuadro para subir el excel de una nueva orden de compra</span>
            </div>
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click para subir</span> or arrastrar/soltar</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">archivo XLSL (MAX. 6GB)</p>
                  </div>
                  <input id="dropzone-file" type="file" className="hidden" onChange={handleChange} />
                </label>
              </div>
            </div>
          </div>
        </div>
        :
        <div className="max-w-2xl m-auto p-6">
          <div className="w-full py-6 text-center">
            <h1 className="text-cyan-800 text-2xl">Subir nueva OC</h1>
            <span>Detalle del procesamiento</span>
          </div>
          {procesando
            ?
            <Loader/>
            :
            <div>
              <div className="bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4 py-3 shadow-md" role="alert">
                <div className="flex">
                  <div className="py-1">
                    <svg className="fill-current h-6 w-6 text-teal-500 mr-4" xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" /></svg></div>
                  <div>
                    <p className="font-bold">Las OCs han sido ingresadas exitósamente</p>
                    {messages.length && messages.map((m: any) =>
                      <p className="text-sm">{m}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-4">
                <button type="submit" onClick={reiniciar}
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  &lt;&lt;&nbsp;&nbsp;&nbsp;VOLVER</button>
              </div>
            </div>}
        </div>
      }
    </main>
  );
}