import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";

interface NewNoteCardProps {
	onNoteCreated: (content: string) => void;
}

let speechRecognition: SpeechRecognition | null;

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
	const [shouldShowOnBoarding, setShouldShowOnBoarding] = useState(true);
	const [content, setContent] = useState("");
	const [isRecording, setIsRecording] = useState(false);

	function handleStartEditor() {
		setShouldShowOnBoarding(false);
	}
	function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {
		setContent(event.target.value);
		if (event.target.value === "") {
			setShouldShowOnBoarding(true);
		}
	}

	function handleSaveNote(event: FormEvent) {
		event.preventDefault();
		if (!content) {
			return toast.error("Insira um conteúdo antes de salvar sua nota!");
		}
		onNoteCreated(content);
		setContent("");
		setShouldShowOnBoarding(true);
	}

	function handleStartRecording() {
		const isSpeechRecognitionAPIAvailable =
			"SpeechRecognition" in window || "webkitSpeechRecognition" in window;

		if (!isSpeechRecognitionAPIAvailable) {
			toast.error(
				"Infelizmente seu navegador não suporta a API de gravação. Por favor, utilize outro navegador ou utilize o modo de digitação",
			);
			return;
		}

		const SpeechRecognitionAPI =
			window.SpeechRecognition || window.webkitSpeechRecognition;

		speechRecognition = new SpeechRecognitionAPI();

		speechRecognition.lang = "pt-BR";
		speechRecognition.continuous = true;
		speechRecognition.maxAlternatives = 1;
		speechRecognition.interimResults = true;

		speechRecognition.onresult = (event) => {
			const transcription = Array.from(event.results).reduce((text, result) => {
				return text.concat(result[0].transcript);
			}, "");

			setContent(transcription);
		};

		speechRecognition.onerror = (event) => {
			console.error(event);
		};

		speechRecognition.start();
		setIsRecording(true);
		setShouldShowOnBoarding(false);
	}

	function handleStopRecording() {
		speechRecognition?.stop();
		setIsRecording(false);
		if (!content) {
			setShouldShowOnBoarding(true);
		}
	}

	function shouldShowSaveButton() {
		if (!shouldShowOnBoarding) {
			return (
				<button
					type="button"
					onClick={handleSaveNote}
					className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500"
				>
					Salvar nota
				</button>
			);
		}
	}

	return (
		<Dialog.Root>
			<Dialog.Trigger
				onClick={() => setShouldShowOnBoarding(true)}
				className="rounded-md flex flex-col text-left bg-slate-700 p-5 gap-3 overflow-hidden hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400 outline-none"
			>
				<span className="text-sm font-medium text-slate-200">
					Adicionar nota
				</span>
				<p className="text-sm leading-6 text-slate-400">
					Grave uma nota em áudio que será convetida para texto automaticamente.
				</p>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="inset-0 fixed bg-black/60" />
				<Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] md:h-[60vh] w-full bg-slate-700 md:rounded-md flex flex-col outline-none">
					<Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
						<X className="size-5" />
					</Dialog.Close>
					<form className="flex-1 flex flex-col">
						<div className="flex flex-1 flex-col gap-3 p-5">
							<span className="text-sm font-medium text-slate-300">
								Adicionar nota
							</span>

							{shouldShowOnBoarding ? (
								<p className="text-sm leading-6 text-slate-400">
									Comece{" "}
									<button
										className="font-medium text-lime-400 hover:underline"
										type="button"
										onClick={handleStartRecording}
									>
										gravando uma nota
									</button>{" "}
									em áudio ou se preferir{" "}
									<button
										className="font-medium text-lime-400 hover:underline"
										type="button"
										onClick={handleStartEditor}
									>
										utilize apenas texto.
									</button>
								</p>
							) : (
								<textarea
									// biome-ignore lint/a11y/noAutofocus: <explanation>
									autoFocus
									className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
									value={content}
									onChange={handleContentChanged}
								/>
							)}
						</div>

						{isRecording ? (
							<button
								type="button"
								onClick={handleStopRecording}
								className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100"
							>
								<div className="size-3 rounded-full bg-red-500  animate-pulse" />
								Gravando... (Clique para parar)
							</button>
						) : (
							shouldShowSaveButton()
						)}
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
