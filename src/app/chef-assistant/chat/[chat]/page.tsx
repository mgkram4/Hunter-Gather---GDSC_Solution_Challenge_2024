"use client";

import Chats from "@components/chef-assistant/chats";
import Messages from "@components/chef-assistant/messages";
import { ROUTES } from "@config/routes";
import { ERROR_RESPONSES } from "@utils/helpers/auth/enums";
import { createClient } from "@utils/supabase/client";
import {
  CollectionReference,
  DocumentData,
  QuerySnapshot,
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFirestore } from "reactfire";

export default function ChefAssistant() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const db = useFirestore();

  const [prompt, setPrompt] = useState<string>();
  const [messages, setMessages] = useState<QuerySnapshot<DocumentData>>();
  const [chats, setChats] = useState<QuerySnapshot<DocumentData>>();
  const [userId, setUserId] = useState<string>("");

  const updateHooks = async (
    messagesCollectionRef: CollectionReference<DocumentData>,
    chatsCollectionRef: CollectionReference<DocumentData>,
  ) => {
    const chatsQuery = query(chatsCollectionRef, orderBy("createdAt", "desc"));
    const chatsDocs = await getDocs(chatsQuery);
    const messageDocs = await getDocs(messagesCollectionRef);

    onSnapshot(messagesCollectionRef, (snapshot) => {
      setMessages(snapshot);
    });
    onSnapshot(chatsQuery, (snapshot) => {
      setChats(snapshot);
    });

    setChats(chatsDocs);
    setMessages(messageDocs);
  };

  const loadData = async () => {
    const { error, data } = await supabase.auth.getUser();
    const hasError = error || !data;

    if (hasError) {
      router.push(`${ROUTES.SIGNIN}?error=${ERROR_RESPONSES.AUTH_REQUIRED}`);
    }
    setUserId(data.user!.id);

    const COLLECTION_PATHS = {
      CHATS: `users/${data.user?.id}/chats`,
      MESSAGES: `users/${data.user?.id}/chats/${params.chat}/messages`,
    };

    const chatsCollectionRef = collection(db, COLLECTION_PATHS.CHATS);
    const messagesCollectionRef = collection(db, COLLECTION_PATHS.MESSAGES);

    await updateHooks(messagesCollectionRef, chatsCollectionRef);
  };

  const handleSendMessages = async () => {
    const COLLECTION_PATHS = {
      CHATS: `users/${userId}/chats/${params.chat}`,
      MESSAGES: `users/${userId}/chats/${params.chat}/messages`,
    };

    const messageCollectionRef = collection(db, COLLECTION_PATHS.MESSAGES);

    await addDoc(messageCollectionRef, { prompt: prompt });
    await updateDoc(doc(db, COLLECTION_PATHS.CHATS), {
      title: messages?.docs[messages?.docs.length - 1]?.data().prompt || prompt,
    });

    setPrompt("");
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className={"flex h-full"}>
      {/* TODO: get specific sizes added into figma */}
      <div className="w-1/5 flex flex-col text-center h-screen border-gray-700 border-2">
        <Chats chats={chats} />
      </div>
      <div className={"w-4/5 flex flex-col h-screen"}>
        <h1 className={"text-xl ml-2"}>Chef Assistant</h1>
        <div className={"overflow-scroll"}>
          <Messages messages={messages} />
        </div>
        <div
          className={
            "flex w-full aboslute border-y-2 border-r-2 border-gray-700 bottom-0 h-10"
          }
        >
          <input
            className={"w-[90%]"}
            onChange={(e) => {
              setPrompt(e.target.value);
            }}
            type="text"
            placeholder="Type here..."
            value={prompt}
          />
          <button className={"p-2"} onClick={handleSendMessages}>
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}
