import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Input, InputGroup, InputGroupText } from "reactstrap";
import { useSelector } from "react-redux";

export default function UnmanWB() {
    const [buffer, setBuffer] = useState("");
    const [vehicle, setVehicle] = useState("");
    const [status, setStatus] = useState(null);
    const [blink, setBlink] = useState(true);
    const [saveStatus, setSaveStatus] = useState("");
    const [netWeight, setNetWeight] = useState("");
    const NODE_URL = "http://localhost:5000";

    const [topStatus, setTopStatus] = useState("");
    const [topStatusType, setTopStatusType] = useState("info");

    const UserDetails = useSelector((state) =>
        state && state.auth ? state.auth.userData : {}
    );

    // ------------------------------------------------------
    //  FETCH STATUS (AUTO + MANUAL)
    // ------------------------------------------------------
    const getStatus = async () => {
    try {
        const res = await axios.get(`${NODE_URL}/status`);
        const data = res.data || {};

        setStatus(data);
        setSaveStatus(data.saveMessage || "");
        setNetWeight(data.netWeight || "");

        const logs = data.logs || [];

        // ---- GET ONLY THE LATEST LOG ENTRY ----
        const latestLog = logs.length > 0 ? logs[logs.length - 1] : "";

        // ---- DETECT ONLY IF LATEST log is an ERROR ----
        const isError =
            latestLog &&
            (latestLog.toLowerCase().includes("error") ||
             latestLog.toLowerCase().includes("fail"));

        if (isError) {
            setTopStatus(latestLog);
            setTopStatusType("error");
        }
        else if (data.saveMessage) {
            // show success / warning message normally
            setTopStatus(data.saveMessage);

            if (data.saveMessage.toLowerCase().includes("success"))
                setTopStatusType("success");
            else if (data.saveMessage.toLowerCase().includes("warning"))
                setTopStatusType("warning");
            else
                setTopStatusType("info");
        }
        else {
            // no message
            setTopStatus("");
        }
    } catch (err) {
        setTopStatus("ERROR: Unable to fetch status");
        setTopStatusType("error");
    }
    };


    // ------------------------------------------------------
    //  SEND VEHICLE (DISALLOW EMPTY VALUE)
    // ------------------------------------------------------
    const sendVehicleToNode = async (vehicleNo) => {
        try {
            if (!vehicleNo || vehicleNo.trim() === "") {
                console.log("IGNORED: Empty vehicle number");
                return;
            }

            await axios.post(`${NODE_URL}/vehicle`, { vehicleNo });
            getStatus();
        } catch (err) {
            setTopStatus("ERROR: Vehicle POST failed");
            setTopStatusType("error");
        }
    };

    // ------------------------------------------------------
    //  PAGE LOAD → ONLY READ STATUS (NO EMPTY POST)
    // ------------------------------------------------------
    useEffect(() => {
        getStatus();
    }, []);

    // ------------------------------------------------------
    //  AUTO REFRESH STATUS
    // ------------------------------------------------------
    useEffect(() => {
        const interval = setInterval(getStatus, 10000);
        return () => clearInterval(interval);
    }, []);

    // ------------------------------------------------------
    //  SEND USER ID TO SERVER
    // ------------------------------------------------------
    // useEffect(() => {
    //     const sendUserId = async () => {
    //         try {
    //             const userId = UserDetails.USERID;
    //             if (!userId) return;

    //             await axios.post(`${NODE_URL}/setSystemNo`, { userId });
    //         } catch (err) {
    //             console.error("Send UserId Error:", err);
    //         }
    //     };

    //     sendUserId();
    //     const interval = setInterval(sendUserId, 10000);
    //     return () => clearInterval(interval);
    // }, [UserDetails]);

    // ------------------------------------------------------
    //  SCANNER LISTENER
    // ------------------------------------------------------
    useEffect(() => {
    let temp = "";

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            const scanned = temp.trim();
            if (scanned.length > 0) {
                setVehicle(scanned);
                sendVehicleToNode(scanned);
            }
            temp = "";
        } else {
            // ignore modifier keys
            if (e.key.length === 1) {
                temp += e.key;
            }
        }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);


    // ------------------------------------------------------
    //  BLINK CURSOR
    // ------------------------------------------------------
    useEffect(() => {
        const interval = setInterval(() => setBlink((prev) => !prev), 300);
        return () => clearInterval(interval);
    }, []);

    // ------------------------------------------------------
    //  UI
    // ------------------------------------------------------
    return (
        <Card style={{ padding: 20 }}>
            {/* TOP STATUS PANEL */}
            {topStatus && (
                <div
                    style={{
                        backgroundColor:
                            topStatusType === "error"
                                ? "red"
                                : topStatusType === "success"
                                ? "green"
                                : topStatusType === "warning"
                                ? "orange"
                                : "dodgerblue",
                        color: "white",
                        padding: "12px 20px",
                        fontWeight: "bold",
                        fontSize: 18,
                        marginBottom: 15,
                        borderRadius: 6,
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {topStatus}
                </div>
            )}

            <div style={{ display: "flex", gap: 40 }}>
                {/* LEFT SIDE */}
                <div style={{ width: "40%" }}>
                    <h2>Vehicle Reader (USB Scanner)</h2>

                    <p style={{ fontSize: 22, marginTop: 30 }}>
                        <b>Last Scanned Vehicle:</b>{" "}
                        <span style={{ color: "green" }}>
                            {vehicle || "Waiting for scan..."}
                        </span>
                    </p>

                    <div
                        style={{
                            fontSize: "40px",
                            fontWeight: "bold",
                            marginTop: "25px",
                            color: blink ? "black" : "white",
                            transition: "0.3s",
                        }}
                    >
                        |
                    </div>

                    <p style={{ color: "#777", marginTop: 20 }}>
                        Keep scanner ready.
                    </p>
                </div>

                {/* RIGHT SIDE */}
                <div
                    style={{
                        width: "50%",
                        padding: "25px",
                        border: "2px solid #d9d9d9",
                        borderRadius: "12px",
                        background: "#ffffff",
                        boxShadow: "0px 3px 10px rgba(0,0,0,0.1)",
                    }}
                >
                    <h2
                        style={{
                            marginBottom: "20px",
                            paddingBottom: "10px",
                            borderBottom: "2px solid #eee",
                        }}
                    >
                        Weighbridge Status
                    </h2>

                    {!status ? (
                        <p>Loading status…</p>
                    ) : (
                        <div style={{ fontSize: 18, lineHeight: "32px" }}>
                            <InputGroup style={{ marginBottom: "12px" }}>
                                <InputGroupText
                                    style={{
                                        backgroundColor: "dodgerblue",
                                        color: "white",
                                        width: "40%",
                                    }}
                                >
                                    User ID
                                </InputGroupText>
                                <Input
                                    value={
                                        status.systemNo +
                                        " - " +
                                        UserDetails.username
                                    }
                                    disabled
                                    style={{
                                        backgroundColor: "dodgerblue",
                                        color: "white",
                                        textAlign: "center",
                                    }}
                                />
                            </InputGroup>

                            <InputGroup style={{ marginBottom: "12px" }}>
                                <InputGroupText
                                    style={{
                                        backgroundColor: "dodgerblue",
                                        color: "white",
                                        width: "40%",
                                    }}
                                >
                                    Scale Port
                                </InputGroupText>
                                <Input
                                    value={status.scalePort}
                                    disabled
                                    style={{
                                        backgroundColor: "dodgerblue",
                                        color: "white",
                                        textAlign: "center",
                                    }}
                                />
                            </InputGroup>

                            <InputGroup style={{ marginBottom: "12px" }}>
                                <InputGroupText
                                    style={{
                                        backgroundColor: "dodgerblue",
                                        color: "white",
                                        width: "40%",
                                    }}
                                >
                                    Latest Weight
                                </InputGroupText>
                                <Input
                                    value={status.latestWeight}
                                    disabled
                                    style={{
                                        backgroundColor: "dodgerblue",
                                        color: "white",
                                        textAlign: "center",
                                    }}
                                />
                            </InputGroup>

                            <InputGroup style={{ marginBottom: "12px" }}>
                                <InputGroupText
                                    style={{
                                        backgroundColor: "dodgerblue",
                                        color: "white",
                                        width: "40%",
                                    }}
                                >
                                    Stable Weight
                                </InputGroupText>
                                <Input
                                    value={status.stableWeight}
                                    disabled
                                    style={{
                                        backgroundColor: "dodgerblue",
                                        color: "white",
                                        textAlign: "center",
                                    }}
                                />
                            </InputGroup>

                            <InputGroup style={{ marginBottom: "12px" }}>
                                <InputGroupText
                                    style={{
                                        backgroundColor: "dodgerblue",
                                        color: "white",
                                        width: "40%",
                                    }}
                                >
                                    Vehicle No
                                </InputGroupText>
                                <Input
                                    value={
                                        status.vehicleNumber ||
                                        vehicle ||
                                        "None"
                                    }
                                    disabled
                                    style={{
                                        backgroundColor: "dodgerblue",
                                        color: "white",
                                        textAlign: "center",
                                        textTransform: "uppercase",
                                    }}
                                />
                            </InputGroup>

                            <InputGroup style={{ marginBottom: "12px" }}>
                                <InputGroupText
                                    style={{
                                        backgroundColor: "dodgerblue",
                                        color: "white",
                                        width: "40%",
                                    }}
                                >
                                    Printer
                                </InputGroupText>
                                <Input
                                    value={status.printerName}
                                    disabled
                                    style={{
                                        backgroundColor: "dodgerblue",
                                        color: "white",
                                        textAlign: "center",
                                    }}
                                />
                            </InputGroup>

                            {netWeight && (
                                <InputGroup style={{ marginBottom: "12px" }}>
                                    <InputGroupText
                                        style={{
                                            backgroundColor: "green",
                                            color: "white",
                                            width: "40%",
                                        }}
                                    >
                                        Net Weight
                                    </InputGroupText>
                                    <Input
                                        value={netWeight}
                                        disabled
                                        style={{
                                            backgroundColor: "green",
                                            color: "white",
                                            textAlign: "center",
                                            fontWeight: "bold",
                                        }}
                                    />
                                </InputGroup>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
